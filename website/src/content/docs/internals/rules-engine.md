---
title: Rule engine
description: How NightJar finds the action for a message, the enforcement matrix and the safety limits.
---

The rule engine is in the `rules` module, and the app and the module run the same code. The app builds a `rules.json`
snapshot from its database and sends it to the module. The module compiles the snapshot once into a `RuleEngine` and
swaps it in. An evaluation doesn't allocate memory and doesn't block, so it can run on the main looper.

## The snapshot

`RulesJson` reads and writes the snapshot. The example uses a synthetic number.

```json
{
  "schema": 1,
  "revision": 42,
  "preset": "RECOMMENDED",
  "classActions": { "CL-WAP-CP": "BLOCK", "CL-FLASH": "NOTIFY" },
  "rules": [
    {
      "id": 1,
      "priority": 0,
      "enabled": true,
      "origin": "USER",
      "name": "Allow carrier settings",
      "action": "ALLOW",
      "when": {
        "classes": ["CL-WAP-CP"],
        "originator": { "op": "IS", "value": "+15550100" }
      }
    }
  ],
  "knownOriginators": { "exact": ["+15550100"], "prefix": [] },
  "guards": { "suplGraceMin": 5 }
}
```

| Field | Content |
|---|---|
| `schema` | Must be 1. The reader rejects any other value. |
| `preset` | `MONITOR`, `RECOMMENDED`, `STRICT`, `QUARANTINE` or `CUSTOM` |
| `classActions` | The action of each message type: `ALLOW`, `NOTIFY`, `QUARANTINE` (Hold) or `BLOCK` |
| `rules` | User rules and preset rules |
| `knownOriginators` | Known senders, as exact numbers and prefixes |
| `guards.suplGraceMin` | The SUPL grace time after an emergency call, from 5 to 60 minutes |

The snapshot can be up to 64 KiB. The reader ignores unknown top-level fields and drops unknown type names and action
values.

### Conditions

All fields of `when` are optional. A rule matches only when all of its conditions match.

| Condition | Match |
|---|---|
| `classes` | The message type. An empty list matches nothing. |
| `subtypes` | The subtype code of the type, as an exact match. A message without a subtype never matches. |
| `originator` | `IS`, `IS_NOT` or `PREFIX` on the normalized number, or `REGEX` on the raw value |
| `originatorKnown` | Whether the sender is a known sender. A missing sender counts as unknown. |
| `smsc` | `IS` or `PREFIX` on the normalized SMSC address |
| `port` | A destination port range, `from` to `to`, inclusive |
| `contentType` | `IS` or `PREFIX` on the WAP content type, case-insensitive |
| `slot` | The SIM slot |
| `roaming` | The roaming state when the message arrived |
| `textContains` | A case-insensitive part of the decoded text |
| `direction` | `IN` or `OUT` |

To normalize a number, the engine removes spaces, each `+` and a leading `00`. In a number that has only digits and
separators, it also removes `-`, `(`, `)` and `.`, so `+1 555-0100` and `+15550100` are equal. Letters in an
alphanumeric sender such as `VM-CARRIER` stay as received, and the engine compares them case-insensitively.

The engine reads the message text only when a rule with `textContains` matches all its other conditions. For a
multipart message, the text condition sees the text of the first part only.

### Regular expressions

`REGEX` on the sender uses `SafeRegex`, a matcher that doesn't backtrack, so its cost grows linearly with the input.

- Supported: literals, `.`, character classes with ranges and negation, `\d \D \w \W \s \S`, `^`, `$`, groups,
  `(?:...)`, `|`, `*`, `+`, `?` and `{n,m}`.
- Not supported: backreferences, lookaround, inline flags, possessive quantifiers and Unicode classes.
- Limits: 200 characters for the pattern and 2,000 instructions for the compiled program. A match stops after 50,000
  steps and counts as no match. All sender patterns of one message share a budget of 1,000,000 steps. When it runs
  out, the remaining patterns count as no match.

A match finds the pattern anywhere in the value unless you use `^` or `$`, and it ignores ASCII case.

### Rules that the engine can't evaluate

The reader keeps a rule but marks it as unsupported when it has an unknown key, operator, action or direction, a value
of the wrong type, an empty value, a sender or SMSC value that is empty after normalization, or a port outside 0 to
65535. An unsupported rule never matches. The engine also skips a rule whose regular expression doesn't compile, and
counts it.

## Order of evaluation

```d2 title="Order of evaluation: find the action, then apply the safety limits"
direction: right
style.fill: "#0b1020"
classes: {
  stage: {label.near: top-left; grid-columns: 1; vertical-gap: 56; style: {fill: "#0f1830"; stroke: "#34508f"; stroke-dash: 4; font-color: "#9db4ea"; border-radius: 14; bold: true}}
  step: {width: 260; style: {fill: "#1b2c55"; stroke: "#5b82e6"; font-color: "#eef2ff"; border-radius: 8}}
  limit: {width: 260; style: {fill: "#2a2010"; stroke: "#d29922"; font-color: "#f5e3b8"; border-radius: 8}}
  input: {width: 260; style: {fill: "#151b28"; stroke: "#56627a"; font-color: "#c9d1e0"; border-radius: 8}}
  result: {width: 260; style: {fill: "#0f2219"; stroke: "#3fb950"; font-color: "#b9f0c4"; border-radius: 8; bold: true}}
}
(** -> **)[*].style: {stroke: "#8ea8ec"; font-color: "#c9d4f2"}

find: "1 · Find the action" {
  class: stage
  msg: "Message\ntype · sender · port · text" {class: input}
  user: "User rules\nfirst match wins" {class: step}
  preset: "Preset rules\nfirst match wins" {class: step}
  type: "Type action\nfrom the snapshot" {class: step}
  allow: "Allow\ndefault" {class: step}
  msg -> user
  user -> preset: no match
  preset -> type: no match
  type -> allow: type not in snapshot
}

limits: "2 · Safety limits, in order" {
  class: stage
  g05: "Action not allowed\nfor this type → reduce" {class: limit}
  g01: "Emergency alert\n→ Allow" {class: limit}
  g04: "SUPL during emergency\n→ Allow" {class: limit}
  safe: "Safe mode\n→ no hold, no block" {class: limit}
  off: "Blocking off\n→ no hold, no block" {class: limit}
  final: "Final action\nAllow · Notify · Hold · Block" {class: result}
  g05 -> g01 -> g04 -> safe -> off -> final
}

find -> limits: "first action found"
```

1. Rules. The engine checks the enabled rules, and the first rule that matches decides. All user rules run before all
   preset rules, so a user rule can make an exception to a preset Hold or Block. In each group, rules run by
   `priority`, lowest first, then in file order.
2. Type action. The action of the message type in `classActions`.
3. Default. Allow.
4. Safety limits. They run after the result, in a fixed order.

If the engine throws, the result is Allow with the reason `ENGINE_ERROR`.

## Enforcement points

The module enforces each message at one point only.

| Hook | Messages |
|---|---|
| HK-08, the head filter | SMS messages on the `InboundSmsHandler` path, except port 2948 |
| HK-14 | WAP push (port 2948). The hook reads the content type first. |
| HK-15 | SIM data download |
| HK-17 | Cell broadcast |
| HK-23 | Voicemail indicator |

The head filter checks the message, identifies its type from the PDU, and asks the engine. For Hold or Block, it ends
the message with `dropFilteredSms`. A blocked WAP push returns `RESULT_CONSUMED` (1), so Android doesn't broadcast it.

The head filter doesn't filter a regular SMS before the first unlock after a reboot. Android keeps the message and
offers it again after the unlock, and the head filter checks it then. Silent SMS, SIM-stored messages and status
reports pass no enforcement point, so NightJar never stops them.

## Enforcement matrix

`EnforcementMatrix` defines the actions that each type accepts. The UI, the rule validator and the module all use this
one table.

- Class actions are the actions that the Protection screen offers for the type.
- Rule actions are the same, with one exception for regular texts. A rule with a sender, port or text condition can
  hold or block regular texts. A rule without such a condition can only allow regular texts or notify you about them.
- Releasable types are types that the module can give back to Android unchanged. Only a releasable type can be held,
  because a hold that nothing can release would act as a block. Malformed SMS and unreadable WAP push aren't
  releasable, because a release would give Android's parser the same broken data.

Some types get their name only after Android delivers the message: voicemail control, missed-call notices,
app-only messages, carrier app messages, chat (RCS) setup and messages handled by the phone maker. No hook can stop a
message under these types, so they get no Hold and no Block, not even in a rule. The head filter can still stop the
message under the type it gives first, for example Data message to a port.

## Safety limits

The safety limits run after the rules, in this order. A limit changes the action to Allow.

| Order | Limit | Wire name | Effect |
|---|---|---|---|
| 1 | Action not allowed | `ACTION_NOT_ALLOWED` | The matrix doesn't allow the action for this type. |
| 1 | Blocks all regular texts | `G05_ALL_NORMAL` | A rule without a sender, port or text condition tried to hold or block regular texts. |
| 2 | Emergency cell broadcast | `G01_EMERGENCY_CB` | An emergency alert is always allowed. The emergency flag of the broadcast decides. |
| 3 | SUPL during an emergency | `G04_SUPL_EMERGENCY` | A location request (WAP push or port 7275) during an emergency call or its grace time is allowed. |
| 4 | Safe mode | `SAFE_MODE` | Hold and Block become Allow. |
| 5 | Blocking off | `FIREWALL_OFF` | The firewall isn't available on this build, or you turned off blocking. Hold and Block become Allow. |

Safe mode and blocking off leave Notify in place. Limits 2 and 3 also remove Notify, because those types accept only
Allow. The event records the original action and the reason, and the message detail shows "Safety limit".

## Presets

The presets are data in `rules/Presets.java`. When you select a preset:

- The preset replaces the type actions and the preset rules.
- Your user rules, known senders and safety limits stay.
- Preset rules get IDs from 1,000,000,000 upwards. User rules get IDs from 1 upwards, so the two never collide.

Some presets add rules for subtypes whose action differs from the type action:

| Rule | Action | Presets |
|---|---|---|
| Hold empty flash messages | Hold | Recommended, Strict |
| Block silent message-waiting signals | Block | Recommended, Strict, Quarantine |
| Hold data messages to port 0 | Hold | Recommended |
| Notify me about data messages to unknown ports and configuration ports | Notify | Recommended |
| Hold data messages to unknown ports | Hold | Strict |
| Block auto-open link pushes | Block | Recommended, Strict, Quarantine |

When a preset asks for an action that the matrix doesn't allow, it uses Notify instead.
[Message types](/NightJar-Postmark/features/message-types/) lists the action of each preset for each type.

## Validation

`RuleValidator` checks a snapshot before the app saves it. The app doesn't save a snapshot with errors.

| Code | Problem |
|---|---|
| `REGEX_INVALID` | `SafeRegex` doesn't support the pattern, or it is malformed. |
| `REGEX_TOO_LONG` | The pattern is longer than 200 characters. |
| `EMPTY_VALUE` | A value is empty, or a sender or SMSC value is empty after normalization. |
| `ACTION_NOT_ALLOWED_FOR_CLASS` | The matrix doesn't allow the action for the rule's type. |
| `BLOCKS_ALL_NORMAL` | The rule would hold or block all regular texts. |
| `TOO_LARGE` | The snapshot is larger than 64 KiB. |
| `INVALID_VALUE` | The port range is out of bounds or reversed, or a subtype doesn't belong to the rule's types. |
| `INVALID_ID` | Two rules share an ID, or a rule ID is in the wrong range for its origin. |

## Fail open

Without a snapshot, the module uses the default: the Monitor preset with no rules, which allows each message. At
startup the module loads its stored copy of the last snapshot, so the default applies only before the app sends rules
for the first time, or when the stored copy can't be read. The module never holds or blocks without a valid
snapshot. If a new snapshot fails to parse, the module keeps the previous one.
