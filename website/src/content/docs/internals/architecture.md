---
title: Architecture
description: The two runtime parts of NightJar, the path of a message, the fail-open rules and the trust boundaries.
---

NightJar ships as one APK with two parts. The **module** runs inside Android's phone service, `com.android.phone`.
The **app** runs as `dev.nightjar` and holds the history, the detectors, the notifications and your settings.

## Runtime parts

```d2 title="NightJar runtime parts: the module in the phone service and the app"
grid-rows: 3
vertical-gap: 100
style.fill: "#0b1020"
classes: {
  ext: {width: 230; style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"; border-radius: 10}}
  proc: {label.near: top-left; style: {fill: "#0f1830"; stroke: "#34508f"; stroke-dash: 4; font-color: "#9db4ea"; border-radius: 14; bold: true}}
  nj: {width: 230; style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"; border-radius: 8}}
  store: {width: 230; shape: cylinder; style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"}}
}
(** -> **)[*].style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}

outside: "" {
  grid-columns: 3
  horizontal-gap: 110
  style: {fill: transparent; stroke: transparent}
  network: "Mobile network" {class: ext; shape: cloud}
  modem: "Modem · radio HAL" {class: ext}
  apps: "Android apps\nmessaging · voicemail · carrier" {class: ext}
  network -> modem: "SMS · CB"
}

phone: "Phone service · com.android.phone" {
  class: proc
  label.near: bottom-left
  grid-rows: 2
  grid-columns: 3
  horizontal-gap: 110
  vertical-gap: 70
  capture: "Capture hooks\nradio · IMS · WAP · SIM" {class: nj}
  filter: "Head filter\nAllow · Notify · Hold · Block" {class: nj}
  queue: "Event queue\nbounded · lock-free" {class: nj; shape: queue}
  stored: "Stored copy\nrules · settings" {class: store}
  snapshot: "Rules snapshot" {class: nj; shape: page}
  capture -> filter
  filter -> queue: observations
  snapshot -> filter: reads {style.stroke-dash: 3}
  stored -> snapshot: "at startup"
}

app: "NightJar app · dev.nightjar" {
  class: proc
  grid-rows: 2
  grid-columns: 3
  horizontal-gap: 110
  vertical-gap: 70
  ui: "UI · notifications" {class: nj}
  rules: "Rules · settings" {class: nj}
  provider: "IPC provider" {class: nj}
  logic: "Classify · severity\ndetectors" {class: nj}
  db: "Encrypted database\nhistory · held PDUs" {class: store}
  provider -> db
  db -> logic
  logic -> ui
  ui -> rules
}

outside.modem -> phone.capture: PDU
phone.filter -> outside.apps: "Allow · Notify"
phone.queue -> app.provider: "events\nContentResolver.call"
app.rules -> phone.snapshot: "control binder\nrules · settings · release"
```

| Part | Process | Work |
|---|---|---|
| Module | `com.android.phone` | Records each message, identifies its type, applies the rules, holds or blocks |
| App | `dev.nightjar` | Stores and explains events, runs detectors, sends notifications, manages rules and settings |

The app compiles your rules into a snapshot and sends it to the module. The module checks each message against the
snapshot and sends what it sees back to the app as events. Events travel over a content provider. Rules, settings
and commands travel over a binder. [IPC](/NightJar-Postmark/internals/ipc/) describes both channels.

Vector or LSPosed loads the module through `dev.nightjar.app.xposed.XposedEntry`, which `assets/xposed_init` lists.
The module uses the legacy Xposed API 82, which both frameworks support.

## Message path

```d2 title="Sequence of one incoming message from the network to the NightJar app"
shape: sequence_diagram
style.fill: "#0b1020"
classes: {
  actor: {style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"}}
  ext: {style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"}}
}
(** -> **)[*].style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}

network: "Network" {class: ext}
phone: "Phone service" {class: ext}
hook: "Capture hook" {class: actor}
filter: "Head filter" {class: actor}
queue: "Event queue" {class: actor}
app: "NightJar app" {class: actor}
apps: "Android apps" {class: ext}

network -> phone: "SMS PDU"
phone -> network: "acknowledgement (never changed)" {style.stroke-dash: 3}
phone -> hook: "newSms · IMS listener"
hook -> queue: "observation"
phone -> filter: "filter chain, first filter"
filter -> filter: "type + rules snapshot"

allow: "Allow or Notify" {
  style: {fill: "#0f2219"; stroke: "#3fb950"; font-color: "#b9f0c4"}
  filter -> phone: "not filtered"
  phone -> apps: "broadcast"
}
stop: "Hold or Block" {
  style: {fill: "#26141a"; stroke: "#e5534b"; font-color: "#ffd8d5"}
  filter -> phone: "dropFilteredSms"
  filter -> filter: "Hold: the PDU goes to the app"
}

filter -> queue: "action"
queue -> app: "events, in batches"
app -> queue: "stored IDs" {style.stroke-dash: 3}
app -> app: "classify · severity · notify"
```

1. The modem passes the PDU to the phone service, and the radio layer acknowledges it to the network. NightJar
   doesn't change the acknowledgement, so the sender sees a blocked message as delivered.
2. A capture hook, for example on `newSms` or the IMS listener, records the raw PDU.
3. NightJar's **head filter** runs first in the `InboundSmsHandler` filter chain. It identifies the type and checks
   the rules snapshot, which returns Allow, Notify, Hold or Block. WAP pushes, SIM data downloads, cell broadcasts
   and voicemail indicators have their own enforcement points. See
   [Rule engine](/NightJar-Postmark/internals/rules-engine/#enforcement-points).
4. For Hold and Block, the head filter ends the message with `dropFilteredSms`. The PDU travels to the app with the
   event, and for Hold the app keeps it so you can release the message later.
5. For Allow and Notify, Android continues as usual. Meaning hooks record which filter or app received the message.
6. Each hook puts its observation into a lock-free queue of 4,096 entries. A worker thread joins the observations
   of one message into a single event. The `NightjarIpc` thread sends the events to the app in batches of up to 50.
7. The app stores the event, gives it a severity, runs the detectors and sends a notification if your settings ask
   for one.

## Startup and connection

The module's session moves through four states: `LOADED`, `HOOKING`, then `RUNNING` or `UNSUPPORTED`.

1. Vector or LSPosed calls `XposedEntry` when `com.android.phone` starts.
2. The module installs its hooks on the main thread of the phone service. If the capture hooks fail, the module
   removes all its hooks and the session is `UNSUPPORTED`.
3. On its worker thread, the module wires the services that need the phone service's context. It loads its stored
   copy of the last rules snapshot, settings and Blocking switch, so it can hold and block before the app connects.
4. The `NightjarIpc` thread sends a `hello` to the app. The reply carries the rules snapshot, the settings and the
   Blocking switch. On a fresh boot the `hello` arrives before the first unlock, when the app can't read your rules.
   The module then keeps the stored copy. After you unlock, the app sends the current rules and settings.
5. The module then sends events, counters, hook health and log lines, one call at a time in that order of priority.

If the app isn't running, refuses the call or was force-stopped, the module keeps recording. Events wait in a buffer
of 1,000 events or 4 MB, and the module retries after 1 second, then backs off up to 60 seconds. When the buffer is
full, the oldest event is dropped and the drop is reported with the next batch. After a reconnect, the module
resends unacknowledged events in their original order.

The module stores the last rules snapshot, settings and Blocking switch in device-protected storage each time the app
sends them, and loads them at startup. Blocking works after a reboot before the first unlock, and stays off if you
turned it off. If a stored file is missing or can't be read, the module uses the default for it: no rules, which
allows each message, and blocking on.

## Held messages and release

The app stores the PDUs of a held message. When you tap **Release**, the app sends the PDUs to the module with the
`RELEASE` command, up to 32 parts. The module registers a token for each part and then injects the parts in order,
so the released message arrives complete and isn't classed as injected or held again. If a part fails, the module
stops and returns the error. The message stays on hold and the app shows the error.

The module refuses to release types that can't be held, such as SIM updates and cell broadcasts, even if a rules file
or the app asks for it.

## Data in the app

- The main database uses Room with SQLCipher. The key is 32 random bytes in app-private storage with mode 0600, so a
  root backup of the app restores a database that still opens.
- Before the first unlock, the main database isn't available. The provider writes incoming events to a staging
  database in device-protected storage, capped at 500 events. The staging database keeps raw event JSON and no
  decoded text. After you unlock, the app moves the staged events into the main database.
- Schema changes use migrations. The app never deletes the database to upgrade it.

## Fail open

If the module fails, Android handles the message as if NightJar weren't installed.

- A catch-all wraps each hook callback. If NightJar's code throws, the original Android method runs.
- Hooks don't do I/O, binder calls, lock waits or file logging on the main looper or the radio HAL threads.
- Without a valid rules snapshot, the module allows each message.
- The head filter reports a message as filtered only after `dropFilteredSms` has run.
- The module doesn't change the network acknowledgement.
- When the event queue is full, the module drops new observations and counts them. Hook threads don't wait. The
  Protection status screen shows the count.

## Trust boundaries

NightJar doesn't trust the mobile network, other apps on the phone, or copies of the app's data.

```d2 title="Trust boundaries and the control at each boundary"
direction: down
style.fill: "#0b1020"
classes: {
  threat: {style: {fill: "#2a1517"; stroke: "#e5534b"; font-color: "#ffd8d5"; border-radius: 10}}
  proc: {label.near: top-left; style: {fill: "#0f1830"; stroke: "#34508f"; stroke-dash: 4; font-color: "#9db4ea"; border-radius: 14; bold: true}}
  nj: {style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"; border-radius: 8}}
  store: {shape: cylinder; style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"}}
  ext: {style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"; border-radius: 10}}
}
(** -> **)[*].style: {stroke: "#e5534b"; font-color: "#ffd8d5"}

net: "Mobile network\nmalformed or hostile PDUs" {class: threat}
other: "Other apps\non the phone" {class: threat}
spoof: "App with the same\npackage name" {class: threat}
copy: "Backup or copy\nof the app data" {class: threat}
internet: "Internet" {class: ext; shape: cloud}

phone: "Phone service\nUID 1001" {
  class: proc
  label.near: bottom-right
  parser: "PDU parser\nnever throws" {class: nj}
  hooks: "Hooks\ncatch-all · fail open" {class: nj}
  binder: "Control binder\napp UID only" {class: nj}
  parser -> hooks: {style.stroke: "#8ea8ec"}
}

app: "NightJar app · own UID" {
  class: proc
  provider: "IPC provider\nUID 1001 only" {class: nj}
  db: "SQLCipher database\nkey in app-private file" {class: store}
  out: "Logs · exports · diagnostics\nmasked numbers and text" {class: nj}
}

net -> phone.parser: "parse"
other -> phone.binder: "refused" {target-arrowhead.shape: cross}
other -> app.provider: "refused" {target-arrowhead.shape: cross}
phone.hooks -> spoof: "no message content" {target-arrowhead.shape: cross}
copy -> app.db: "encrypted · cloud backup off"
app -> internet: "no INTERNET permission" {style.stroke-dash: 4; target-arrowhead.shape: cross}
phone.hooks -> app.provider: "events after the\ncertificate matches" {style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}}
```

| Boundary | Control |
|---|---|
| Mobile network to module | The parser (`pduparse`) never throws, and a catch-all wraps each hook. |
| Other apps to module | The control binder accepts calls only from the app's UID. |
| Other apps to app | The IPC provider accepts calls only from UID 1001, the phone process. |
| App with the same package name | The module checks the app's signing certificate and sends no message content until it matches. |
| Copies of the database file | SQLCipher encrypts the database, and cloud backup is off. The key is in app-private storage, so a copy of the whole app data, for example a root backup, includes the key. |
| App to internet | The app has no internet permission. A build check fails if a change adds it. |

To report a security issue, see the [security policy](/NightJar-Postmark/security/).

## Gradle modules

```d2 title="Gradle modules and their dependencies"
direction: down
style.fill: "#0b1020"
classes: {
  android: {style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"; border-radius: 8}}
  pure: {style: {fill: "#14243a"; stroke: "#3fa7c9"; font-color: "#e2f4fb"; border-radius: 8}}
  stub: {style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"; border-radius: 8; stroke-dash: 4}}
}
vars: {
  d2-legend: {
    a: "Android module" {class: android}
    p: "JVM module, no Android" {class: pure}
    s: "Compile-only stub" {class: stub}
  }
}
(** -> **)[*].style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}

app: "app\nCompose UI · Room · Xposed entry" {class: android}
payload: "payload\nruns in com.android.phone" {class: pure}
decoder: "decoder\nKotlin, no Android" {class: pure}
rules: "rules\nengine · presets · matrix" {class: pure}
pduparse: "pduparse\nnever throws" {class: pure}
contract: "contract\nwire names · ClassId" {class: pure}
xstubs: "xposed-stubs" {class: stub}
hstubs: "hiddenapi-stubs" {class: stub}

app -> payload
app -> decoder
app -> rules
app -> contract
app -> xstubs: compile only {style.stroke-dash: 3}
payload -> rules
payload -> pduparse
payload -> contract
payload -> hstubs: compile only {style.stroke-dash: 3}
decoder -> pduparse
rules -> contract
pduparse -> contract
```

| Module | Contents |
|---|---|
| `app` | The companion app (Kotlin, Jetpack Compose, Hilt, Room with SQLCipher) and the Xposed entry point |
| `payload` | Code that runs in the phone service: hooks, capture, firewall, IPC and the event store. No Android app dependencies. |
| `contract` | Wire names, IPC keys, message types (`ClassId`) and subtypes shared by the payload and the app |
| `rules` | The rules model, rule engine, presets and enforcement matrix |
| `pduparse` | A pure-Java parser for PDU, UDH, WSP, WBXML and OTA data that never throws |
| `decoder` | PDU and cell broadcast decoders in Kotlin, built on `pduparse` |
| `xposed-stubs`, `hiddenapi-stubs` | Compile-only API stubs |
| `buildSrc` | Gradle tasks for the quality checks |

The build compiles the payload to a separate dex, and a quality check inspects that dex.

## Read next

- [Hooks](/NightJar-Postmark/internals/hooks/): where the module attaches, and what happens when a hook is missing.
- [Rule engine](/NightJar-Postmark/internals/rules-engine/): how a message gets its action, and the safety limits.
- [IPC](/NightJar-Postmark/internals/ipc/): the channels between the module and the app.
