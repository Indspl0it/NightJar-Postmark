---
title: Hooks
description: How the NightJar module hooks the SMS path of the phone service, stage by stage, and how each hook fails open.
---

The NightJar module hooks methods of the Android telephony framework inside `com.android.phone`. Each hook has an ID
(HK-xx), a tier, a kind (`BEFORE`, `AFTER` or `AROUND`) and a target class and method. Most hooks are entries in
`payload/src/main/java/dev/nightjar/payload/hook/HookCatalog.java`. A few have their own registrar, which the
sections below name.

Most hooks only observe: they record a stage of the message and return. A small set are enforcement points, where
NightJar can stop a message. The diagram shows the incoming path. Blue boxes observe, amber boxes can enforce.

```d2 title="Incoming SMS path through the phone service, with the NightJar hook at each stage"
direction: down
style.fill: "#0b1020"
classes: {
  ext: {width: 230; style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"; border-radius: 10}}
  obs: {width: 260; style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"; border-radius: 8}}
  enf: {width: 260; style: {fill: "#2a2010"; stroke: "#d29922"; font-color: "#f5e3b8"; border-radius: 8}}
}
(** -> **)[*].style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}

net: "Mobile network" {class: ext; shape: cloud}
radio: "Radio HAL · newSms\nHK-01" {class: obs}
ims: "IMS listener · onSmsReceived\nHK-04" {class: obs}
cb: "Cell broadcast handler\nHK-17" {class: enf}
dispatch: "dispatchMessage\nHK-06" {class: obs}
branch: "dispatchMessageRadioSpecific\nHK-07" {class: obs}
usim: "handleUsimDataDownload\nHK-15" {class: enf}
mwi: "updateMessageWaitingIndicator\nHK-23" {class: enf}
wap: "dispatchWapPdu\nHK-14" {class: enf}
head: "NightJar head filter\nHK-08" {class: enf}
filters: "Android filters\nHK-09 · HK-10 · HK-11" {class: obs}
drop: "dropFilteredSms\nHK-13b" {class: obs}
intent: "dispatchIntent\nHK-13a" {class: obs}
sim: "SIM" {class: ext}
apps: "Apps" {class: ext}

net -> radio: SMS
net -> ims: "SMS over IMS"
net -> cb: "cell broadcast"
radio -> dispatch
ims -> dispatch
dispatch -> branch
branch -> usim: "data download"
branch -> mwi: "voicemail\nindicator"
branch -> wap: "port 2948"
branch -> head: "other SMS"
usim -> sim: envelope
head -> filters: "Allow · Notify"
head -> drop: "Hold · Block"
filters -> intent
intent -> apps
wap -> apps: broadcast
```

## How the module gets in

Vector or LSPosed loads the module into the processes of its scope, which the APK declares as `com.android.phone`
(manifest metadata `xposedscope`, Xposed API 82). The framework calls `dev.nightjar.app.xposed.XposedEntry`, which
`assets/xposed_init` lists. [Architecture](/NightJar-Postmark/internals/architecture/) describes the two runtime parts and
the IPC that follows.

### Startup

1. `XposedEntry.handleLoadPackage` returns at once unless the package and process are `com.android.phone` and the
   UID is 1001. It starts the payload once per process. It reads `nightjar-profiles.json` from the module's resources
   and calls `Entry.start` with the phone application's class loader (`lpparam.classLoader`).
2. `Entry.start` runs on the main thread of the phone service. The application has no `Context` yet, so this step
   uses reflection only, with no I/O and no binder calls. The session moves from `LOADED` to `HOOKING`, and the
   payload resolves and installs each hook in the catalog.
3. The tier manager checks the capture tier. If it fails, the module removes all its hooks, the session becomes
   `UNSUPPORTED`, and Android runs as if NightJar weren't installed. Otherwise the session becomes `RUNNING`.
4. On the payload worker, the module waits for the `Context`. It checks every 200 ms for about 60 seconds, then
   doubles the wait up to 30 seconds. It then runs the wiring steps in this order: environment, injection tokens,
   stored Blocking switch, stored rules and settings, firewall, release and self-test injection, cell broadcast
   channel hooks, outbound pipeline, pending-unlock spool, IPC and replay.

Each wiring step runs once. A step that fails is logged and runs again at the next attempt, 1 second later and then
doubling up to 30 seconds. The other steps stay in place, and capture continues. The firewall step builds the
enforcers, puts the head filter into the handlers that already exist and then resolves the OnePlus hooks.

`Entry.start` runs inside a catch-all. It returns 0 when the session reaches `RUNNING`, -1 after a caught failure, and
-2 for an unsupported build.

A hook can fire before wiring ends. The capture and meaning hooks record from the first call. The firewall bodies
(HK-15, HK-23, HK-24) run the original method unchanged, and the WAP push and cell broadcast hooks allow every
message. A send before the outbound step isn't recorded. Until the IPC `hello` reply, the module uses the stored copy
of the rules. Without a copy, every type is set to Allow.

### Finding a target

`Resolver` finds each target with the phone application's class loader. Each `HookSpec` names one way to find its
target:

- **Name.** The class by name, then the method by name and parameter count. A method declared on a superclass is
  found by a scan of the class hierarchy. A target named `<init>` resolves to the declared constructor (HK-24).
- **Anonymous class.** The resolver checks `Outer$1` to `Outer$30` for a class whose hierarchy contains the given
  superclass or interface and that declares the method. HK-04, HK-05 and HK-17 use this.
- **Overload.** Name and parameter count, for the `SmsController.send*` methods (HK-19), whose signatures change
  between builds.
- **Implementation loader.** The class loader of the OnePlus `mImpl` object (HK-30, HK-32). These resolve later, on
  the worker.

No catalog entry lists parameter types, so a change of parameter types between builds doesn't break the lookup. A
missing class or method gives `NOT_FOUND`. Any other error during the lookup, or a hook that the Xposed bridge
refuses, gives `FAILED`.

## Incoming messages

### Radio and IMS receive

The first hooks see the PDU as the radio or the IMS stack delivers it. They copy the bytes, record one observation
and return.

- **HK-01**, `MessagingIndication.newSms`, the AIDL radio. **HK-01b**, `RadioIndication.newSms`, is its HIDL twin.
  Both are after-hooks on a radio HAL binder thread.
- **HK-04**, `onSmsReceived` on the anonymous `IImsSmsListener.Stub` inside `ImsSmsDispatcher`. It runs before the
  original on an IMS binder thread. A PDU in a format other than 3GPP is counted and not recorded, because NightJar
  has no CDMA support.
- **HK-02** and **HK-02b**, `newSmsStatusReport` on the AIDL and HIDL radio, and **HK-05**,
  `onSmsStatusReportReceived` on the IMS listener, record delivery reports.
- **HK-03**, `MessagingIndication.newSmsOnSim`, records the index of a message that the modem stored on the SIM.
  **HK-03b**, `SIMRecords.handleSms`, marks the next dispatch of that TPDU as read from the SIM.
- **HK-21**, `SmsController.injectSmsPduForSubscriber`, records the UID of an app that adds a message to the incoming
  path, so the dispatch that follows gets the type Injected and a package name.

HK-01 or HK-01b and HK-04 are capture-required. If none of the radio hooks resolves, or HK-04 doesn't, the module
removes all hooks. On a phone where HK-01 is live, HK-01b and HK-02b report `NOT_APPLICABLE`, because the HIDL methods
are never called.

### Dispatch

- **HK-06**, `InboundSmsHandler.dispatchMessage`, is an after-hook on the main looper. It records the TPDU, the
  source, the result and the phone ID. HK-06 is capture-required.
- **HK-07**, `GsmInboundSmsHandler.dispatchMessageRadioSpecific`, records the branch that Android took: type 0, SIM
  data download, voicemail indicator, storage full or normal.

A type 0 message ends in this method, so no enforcement point sees it. SIM data downloads and voicemail indicators
leave here for their own handlers, which have their own enforcement points (HK-15 and HK-23). Normal messages go to
the raw table and then to the filter chain, or to WAP push dispatch for port 2948.

### The head filter

The head filter, HK-08, is NightJar's `SmsFilter` (`NjSmsFilter`) at the front of the filter chain of each
`InboundSmsHandler`. It has no hook of its own. Android calls it directly on the main looper.

Two paths put it in the chain:

- **HK-24** is an after-hook on the `InboundSmsHandler` constructor. It covers handlers created later, for example
  after a SIM swap.
- A startup sweep covers the handlers that exist when the module starts. It reads `PhoneFactory.getPhones()` and
  calls `getInboundSmsHandler(false)` on each phone, with a field scan as a fallback. Only the 3GPP handler is
  swept.

Both paths post the install to the handler's own looper. `FilterInstaller` reads `mSmsFilters`, puts the NightJar
filter first and writes the chain back through `setSmsFiltersForTesting`. If the chain already starts with the
NightJar filter, it changes nothing. If it can't read the chain, it leaves the stock chain in place and the handler
runs without the head filter. The module marks HK-08 as `LIVE` only when a chain contains the filter.

For each message, `SmsFilterCore` works through these checks in order:

1. A self-test canary token: the filter drops the message. This works with blocking off.
2. A release or replay token from NightJar: the filter delivers the message without rules.
3. The user hasn't unlocked the phone since boot: the filter delivers. Android keeps the message in its raw table and
   offers it again after the unlock.
4. Port 2948: the filter delivers and leaves the push to HK-14.
5. The filter identifies the type from the first PDU. A text rule sees the text of part 1 only. Types without an
   enforcement point at the head filter pass unchanged.
6. The engine returns the action. For Hold and Block, the filter calls `dropFilteredSms` and returns true.

The filter calls the private `dropFilteredSms` through reflection with `blocked=true`, which deletes the raw-table row
permanently. With `blocked=false` a later release of the same PDU would fail the duplicate check. The verdict is
published only after the drop has run. Any exception returns false, so the message is delivered, and counts as an
HK-08 error. [Rule engine](/NightJar-Postmark/internals/rules-engine/#enforcement-points) lists the types that each
enforcement point handles.

### After the head filter

These meaning hooks record which filter or app took the message. A missing one only makes the affected results
time-based.

- **HK-09**, `VisualVoicemailSmsFilter.filter`, and **HK-10**, `MissedIncomingCallSmsFilter.filter`, record whether
  the filter took the message.
- **HK-11**, `InboundSmsHandler$CarrierServicesSmsFilterCallback.onFilterComplete`, records the result of the
  carrier services filter. Bit 0 means drop.
- **HK-12**, `AppSmsManager.handleSmsReceivedIntent`, records an app-only message.
- **HK-13a**, `InboundSmsHandler.dispatchIntent`, records the receiving package from the intent's component.
- **HK-13b**, `InboundSmsHandler.dropFilteredSms`, records who dropped the message: NightJar, the blocked-numbers
  list or another filter.
- **HK-13c**, `BlockChecker.getBlockStatus`, records the status from the system blocked-numbers list.

### WAP push

**HK-14** wraps `WapPushOverSms.dispatchWapPdu` (`AROUND`) on the main looper. It is the only enforcement point for
WAP push.

Before the original runs, the hook parses the WSP header of the push payload:

- A canary is consumed. A release or replay runs the original.
- A header that can't be parsed is consumed only while blocking is allowed: firewall available, Blocking on, safe
  mode off. Otherwise the original runs.
- For a valid header, the content type gives the type, and the engine decides with the sender address that Android
  resolved.

A blocked push returns 1 (`RESULT_CONSUMED`), so Android doesn't broadcast it and the SMS state machine doesn't wait.
The hook never returns -1, which means "broadcast sent".

HK-14 also has a shield. A malformed WAP push from the network can make the original parser throw. When it throws
`IndexOutOfBoundsException`, `IllegalArgumentException`, `NegativeArraySizeException` or `BufferUnderflowException`,
the shield consumes the push, returns 1 and records a Block with the reason `MALFORMED`. Without it, the exception
would reach the SMS state machine and stop the phone process. Any other exception is rethrown unchanged. The shield
is set when HK-14 installs, so it works before wiring and with Blocking off. The hook health counts recoveries
separately from errors. After the original runs, the hook records its result: -1 for a broadcast, 1 when
`WapPushManager` consumed the push.

### SIM data download

**HK-15** is a before-hook on `UsimDataDownloadHandler.handleUsimDataDownload` on the main looper. It reads the
originator and PDU from the `com.android.internal.telephony.gsm.SmsMessage` argument. A block skips the original with
the result 1. The handler then sends a plain RP-ACK, and the SIM gets no envelope and returns no proof of receipt
(PoR). The result is never -1. A canary takes the same path, so the dummy command packet never reaches the SIM.

**HK-15b**, `UsimDataDownloadHandler.sendSmsAckForEnvelopeResponse`, records the status words SW1 and SW2 of the
SIM's response. The handler keeps no tracker, so the module joins this stage to the newest open message of the phone.

### Voicemail indicator

**HK-23** is a before-hook on `GsmInboundSmsHandler.updateMessageWaitingIndicator`. Android updates the indicator
inside `dispatchMessageRadioSpecific`, before any filter, so skipping this call is the only way to block a voicemail
indicator. The skip covers both set and clear. The head filter also drops a store indicator that the rules stop.

- Hold also skips the call. When you release the message, the module injects it again, and the hook lets the call
  run while the release is in progress.
- The hook receives only the indicator value. It skips the call for a canary only while a voicemail indicator canary
  is in progress, so real indicators keep working during other self-tests.

HK-15 and HK-23 receive no subscription, so rules with a slot or roaming condition see an unknown slot and no
roaming there.

### Messages that wait for the first unlock

- **HK-16**, `SmsBroadcastUndelivered.scanRawTable`, records each scan of the raw table. Parts that never complete
  get the result Incomplete when the module's timer expires.
- **HK-26**, `SmsBroadcastUndelivered.broadcastSms`, records the replay of a message after the unlock. The head filter
  checks the message at that time.

The other enforcement points run before the unlock with the stored rules. See
[IPC](/NightJar-Postmark/internals/ipc/#before-the-first-unlock).

### Cell broadcast

**HK-17** is a before-hook on `handleMessage` of the anonymous `Handler` inside `CellBroadcastServiceManager`, on
the cell broadcast handler looper. The raw page arrives as the `result` of the `AsyncResult` in `msg.obj`. The hook
copies it and reads the serial number, message ID and page from the 3GPP TS 23.041 header, in GSM or UMTS layout. A
header that isn't clear counts as an emergency. The app joins the pages.

- Emergency channels always run the original: ETWS 4352 to 4359, CMAS 4370 to 4399 and the national alert ranges.
  The hook checks this before the engine runs, so a hand-edited rules file can't suppress an alert.
- A broadcast in the data download range is checked as the type SIM cell broadcast.
- A block skips the original. `handleMessage` returns nothing, so Android doesn't process the broadcast.
- The setting `cb.log=false` stops the event and leaves the block decision in place.

**HK-18a** and **HK-18b** implement **Receive all channels**. `CbChannelHooks` registers them during the cell
broadcast wiring step. Both are before-hooks on `CellBroadcastConfigTracker`:

- HK-18a, `setGsmConfig`, replaces the channel list with one range from 0 to 65535.
- HK-18b, `setActivation`, forces activation on for the GSM radio type.

They change nothing while the setting is off. If the framework's range type can't be built, the original list passes
unchanged. When you turn the setting off, the wide table stays until the cell broadcast app sends its next
configuration. See [Cell broadcast](/NightJar-Postmark/features/cell-broadcast/#settings).

The SUPL limit during an emergency call needs the emergency call state. This is HK-25 in the code, and it isn't a
hook: `EmergencyWatcher` reads `Phone.isInEmergencyCall` on each phone every 2 seconds on the worker, with a longer
wait of up to 60 seconds after failed reads. The end of a call starts the grace time.

## Outgoing messages

The outgoing hooks feed one ledger that links a send request to the PDU the dispatcher built and to the result.

- **HK-19a to HK-19i** are before-hooks on the nine `SmsController.send*` entry points, on binder threads. One body
  serves all nine. The method name and parameter count select the parameter map.
- **HK-20**, `SMSDispatcher.sendRawPdu`, records each `SmsTracker` with its PDU. This method calls `sendSms` once per
  tracker, so the module hooks it alone and records each send once. It also records sends that never pass
  `SmsController`, such as SIM toolkit and phone internals.
- **HK-22**, `CatService.sendStkSms`, marks the next send from the phone package as sent by the SIM. It accepts any
  parameter count, because the method takes `SendSMSParams` on Android 17 and five parameters on OnePlus.
- **HK-27**, `SMSDispatcher.handleSendComplete`, records the result of a send over the circuit-switched path. An IMS
  send never reaches it, so **HK-27b** and **HK-27c**, `SmsTracker.onSent` and `SmsTracker.onFailed`, record the
  result for every transport. The ledger keeps the first result for a tracker. Without them, an IMS send gets the
  result Send unconfirmed after a timeout.

HK-19 is also an enforcement point, for the per-app **Block sending** switch. For a blocked app, the gate fails each
sent `PendingIntent` with `RESULT_ERROR_GENERIC_FAILURE`, and the hook skips the original, so nothing is sent. The
app sees a normal radio failure. The gate never blocks a send by the phone process itself or a send to an emergency
number. Safe mode, Blocking off or the outgoing monitor off allow every send, and any error allows the send. See
[Outgoing messages](/NightJar-Postmark/features/outgoing/#block-an-app-from-sending).

An exception in an outgoing hook body is caught and logged in the body, so it never reaches the send.

## What keeps it safe

### Callback rules

The Xposed backend replaces each hooked method with `Hooker.call`, which runs the whole call: `before`, the original
through `XposedBridge.invokeOriginalMethod`, then `after`. Because of this, a callback that another module put on the
same method with a lower priority doesn't run for that call.

- If `before` throws, the module counts the error and the original method runs as if no hook existed.
- If `after` throws, the module counts the error and the original result stands.
- If the original method throws, the module throws the same exception again. The HK-14 shield is the one exception.
- If the original method can't be called because of a reflection error, the module disables the hook at once and
  returns the default value.
- A skipped method that returns a primitive gets a default value, never null.
- A hook that throws more than 20 times in one session becomes `DISABLED`. The worker removes it and the tier manager
  checks the tiers again.

Hook callbacks run on the thread that called the hooked method, such as the main looper or a radio HAL binder thread.
They don't do I/O, binder calls, JSON work or lock waits.

The head filter is called by Android, not through `Hooker`, so it has its own catch-all that delivers the message on
any error.

Some hooked methods are small enough for ART to inline into their callers: HK-06, HK-15b, HK-23, HK-26, HK-30 and
HK-32. After the install, the worker asks LSPosed to deoptimize them through `XposedBridge.deoptimizeMethod`, so the
hook runs. If the framework doesn't offer that method, nothing else changes.

### Hook states

- `LIVE`: the hook is installed and runs.
- `NOT_FOUND`: the resolver didn't find the target on this build.
- `FAILED`: the target was found, but the install failed.
- `DISABLED`: the hook threw too often and the module removed it.
- `NOT_APPLICABLE`: the hook doesn't apply to this build, or this payload has no body for it.

The module sends the hook health to the app. For each hook it carries the state, tier, target, error count, shield
recovery count, last error and the p50 and p99 callback time. It also carries the live and total count of each tier
(without `NOT_APPLICABLE` hooks), the firewall state and the dropped event counts. In researcher mode, the
[Protection status](/NightJar-Postmark/guide/protection-status/) screen shows the state of each hook.

### Tiers and groups

Each hook has one tier:

- **capture-required**: records the incoming message. Without these hooks, NightJar can't record messages.
- **capture-optional**: records more paths or more detail.
- **meaning**: records what happened to a message, such as the filter or app that received it.
- **firewall-core**: the points where NightJar holds or blocks a message.
- **firewall-extra**: more points for some types.
- **outbound**: records the messages that apps and the SIM send.

`TierManager` combines hooks into four groups. It checks them after the install and again after each change of state:

- **Capture**: HK-06, HK-04, and HK-01 or HK-01b. If one is missing, the module removes all hooks and reports
  `UNSUPPORTED`. This also applies when the capture group fails later in a running session.
- **Firewall**: HK-24, HK-14 and HK-15. If one is missing, the firewall is unavailable and actions are limited to
  Allow and Notify. Canaries are still intercepted.
- **Outbound**: HK-19a to HK-19i except HK-19d, and HK-20. If one is missing, the module doesn't record outgoing
  messages.
- **Meaning**: HK-07, HK-09 to HK-12 and HK-13a to HK-13c. If one is missing, only the affected results become
  time-based. Nothing else stops.

The tier and the group aren't the same thing. HK-17 is capture-optional and still enforces cell broadcast rules.
HK-16 and HK-26 have the meaning tier, but no group depends on them.

### When a target isn't found

The module logs each unresolved hook once, with its state and reason, and continues. The group rules above decide
what else stops. Some hooks are expected to be absent and report `NOT_APPLICABLE`, which doesn't fail the capture
tier:

- HK-01b and HK-02b, when HK-01 is live: a phone with the AIDL radio interface doesn't use the HIDL methods.
- HK-19d on OnePlus, which has no `sendRawPduForSubscriber`. HK-20 still records raw PDUs.
- HK-30 and HK-32 on builds from other makers, and on OnePlus until the `mImpl` class loader is found.

### OnePlus

OnePlus, OPPO and realme builds share the OPlus telephony code. The module detects them from the matched build
profile, or from a fingerprint that starts with `oneplus/`, `oppo/` or `realme/`. Three hooks record what the OPlus
code does:

- **HK-30**, `OplusInboundSmsHandlerImpl.oemCheck`: a false result means the OEM code took the message. This runs
  before the filter chain, so NightJar can record the drop and can't prevent it.
- **HK-31**, `InboundSmsHandler.romDispatchSmsDeliveryIntent`: when the last argument `blocked` is true, the hook
  records an OEM redirect. The call doesn't name the receiving package. On other builds the method doesn't exist and
  HK-31 reports `NOT_FOUND`, which affects no group.
- **HK-32**, `OplusSmsBroadcastUndelivered.scanRawTable`: records the OPlus scan that removes raw-table parts after
  one day.

HK-30 and HK-32 live in classes that the phone application's class loader can't see. After the startup sweep, the
module takes the class loader of the `mImpl` object of the first inbound handler and resolves them with it. If it
doesn't find one, both stay off and the module logs a warning.

## Add a hook

Each new hook must:

1. Have a `HookSpec` in `HookCatalog` with an ID, a tier, a kind, the target and the way to find it, and a defined
   behaviour when the target isn't found.
2. Have a body in `PayloadRuntime`: an ID in `BODIES` and a case in the dispatcher. A hook without a body reports
   `NOT_APPLICABLE` with the reason "no body in this build".
3. Run its callback inside the `Hooker` catch-all, with no I/O, binder calls, JSON work, lock waits or file logging on
   the main looper or on HAL threads.
4. Keep the tier rules in `TierManager` true. Add the hook to a group only if that group can't work without it.
5. Join `DEOPTIMIZE_HOOKS` if ART can inline the target into its callers.
6. Have a unit test with fake framework classes that proves the original result doesn't change when the hook throws.

An enforcement point must never return a result that makes Android broadcast a blocked message, and must report a
message as filtered only after `dropFilteredSms` has run. [Contributing](/NightJar-Postmark/dev/contributing/#add-a-hook)
lists the other requirements for a change.

## Hook reference

Kind: B is `BEFORE`, A is `AFTER`, R is `AROUND`. Role: E marks an enforcement point, O a hook that only observes.

| Stage | ID | Target | Kind | Tier | Role |
|---|---|---|---|---|---|
| Receive | HK-01 | `MessagingIndication.newSms` (AIDL radio) | A | capture-required | O |
| Receive | HK-01b | `RadioIndication.newSms` (HIDL radio) | A | capture-optional | O |
| Receive | HK-02, HK-02b | `newSmsStatusReport` (AIDL, HIDL) | A | capture-optional | O |
| Receive | HK-03 | `MessagingIndication.newSmsOnSim` | A | capture-optional | O |
| Receive | HK-03b | `SIMRecords.handleSms` | B | capture-optional | O |
| Receive | HK-04 | `ImsSmsDispatcher` listener `onSmsReceived` | B | capture-required | O |
| Receive | HK-05 | `ImsSmsDispatcher` listener `onSmsStatusReportReceived` | B | capture-optional | O |
| Receive | HK-21 | `SmsController.injectSmsPduForSubscriber` | B | capture-optional | O |
| Dispatch | HK-06 | `InboundSmsHandler.dispatchMessage` | A | capture-required | O |
| Dispatch | HK-07 | `GsmInboundSmsHandler.dispatchMessageRadioSpecific` | A | meaning | O |
| Head filter | HK-24 | `InboundSmsHandler` constructor | A | firewall-core | installs HK-08 |
| Head filter | HK-08 | `NjSmsFilter.filterSms`, first in the filter chain | none | firewall-core | E |
| Filters | HK-09 | `VisualVoicemailSmsFilter.filter` | A | meaning | O |
| Filters | HK-10 | `MissedIncomingCallSmsFilter.filter` | A | meaning | O |
| Filters | HK-11 | `CarrierServicesSmsFilterCallback.onFilterComplete` | B | meaning | O |
| Filters | HK-12 | `AppSmsManager.handleSmsReceivedIntent` | A | meaning | O |
| Filters | HK-13a | `InboundSmsHandler.dispatchIntent` | A | meaning | O |
| Filters | HK-13b | `InboundSmsHandler.dropFilteredSms` | A | meaning | O |
| Filters | HK-13c | `BlockChecker.getBlockStatus` | A | meaning | O |
| WAP push | HK-14 | `WapPushOverSms.dispatchWapPdu` | R | firewall-core | E |
| SIM data download | HK-15 | `UsimDataDownloadHandler.handleUsimDataDownload` | B | firewall-core | E |
| SIM data download | HK-15b | `UsimDataDownloadHandler.sendSmsAckForEnvelopeResponse` | B | meaning | O |
| Voicemail indicator | HK-23 | `GsmInboundSmsHandler.updateMessageWaitingIndicator` | B | firewall-extra | E |
| First unlock | HK-16 | `SmsBroadcastUndelivered.scanRawTable` | A | meaning | O |
| First unlock | HK-26 | `SmsBroadcastUndelivered.broadcastSms` | B | meaning | O |
| Cell broadcast | HK-17 | `CellBroadcastServiceManager` handler `handleMessage` | B | capture-optional | E |
| Cell broadcast | HK-18a | `CellBroadcastConfigTracker.setGsmConfig` | B | firewall-extra | changes channels |
| Cell broadcast | HK-18b | `CellBroadcastConfigTracker.setActivation` | B | firewall-extra | changes channels |
| Outgoing | HK-19a | `SmsController.sendTextForSubscriber` | B | outbound | E |
| Outgoing | HK-19b | `SmsController.sendTextForSubscriberWithOptions` | B | outbound | E |
| Outgoing | HK-19c | `SmsController.sendDataForSubscriber` | B | outbound | E |
| Outgoing | HK-19d | `SmsController.sendRawPduForSubscriber` | B | outbound | E |
| Outgoing | HK-19e | `SmsController.sendMultipartTextForSubscriber` | B | outbound | E |
| Outgoing | HK-19f | `SmsController.sendMultipartTextForSubscriberWithOptions` | B | outbound | E |
| Outgoing | HK-19g | `SmsController.sendStoredText` | B | outbound | E |
| Outgoing | HK-19h | `SmsController.sendStoredMultipartText` | B | outbound | E |
| Outgoing | HK-19i | `SmsController.sendVisualVoicemailSmsForSubscriber` | B | outbound | E |
| Outgoing | HK-20 | `SMSDispatcher.sendRawPdu` | B | outbound | O |
| Outgoing | HK-22 | `CatService.sendStkSms` | B | outbound | O |
| Outgoing | HK-27 | `SMSDispatcher.handleSendComplete` | A | outbound | O |
| Outgoing | HK-27b | `SMSDispatcher$SmsTracker.onSent` | A | outbound | O |
| Outgoing | HK-27c | `SMSDispatcher$SmsTracker.onFailed` | A | outbound | O |
| OnePlus | HK-30 | `OplusInboundSmsHandlerImpl.oemCheck` | A | meaning | O |
| OnePlus | HK-31 | `InboundSmsHandler.romDispatchSmsDeliveryIntent` | B | firewall-extra | O |
| OnePlus | HK-32 | `OplusSmsBroadcastUndelivered.scanRawTable` | A | meaning | O |
