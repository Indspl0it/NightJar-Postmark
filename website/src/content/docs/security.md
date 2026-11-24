---
title: Security policy
description: How to report a vulnerability in NightJar, and what is in scope.
---

## Report a vulnerability

Don't open a public issue for a security problem. Use GitHub's private vulnerability reporting on the repository:
**Security** > **Advisories** > **Report a vulnerability**.

Include:

1. The NightJar version (Settings > About).
2. The build fingerprint (`adb shell getprop ro.build.fingerprint`).
3. The root manager, the Zygisk implementation, and the Xposed framework (Vector or LSPosed) with its version.
4. The impact: what an attacker gets, and what the attacker needs, such as a malformed SMS, a malicious app or
   physical access.
5. A minimal reproduction, if you have one.

Don't include real message text or full phone numbers.

You get an acknowledgement within 7 days and a decision within 30 days. Give us time to release a fix before you
publish the problem.

## Scope

In scope:

- The payload that runs in `com.android.phone` (`payload/`) and the Xposed entry (`app/.../xposed/`).
- The app (`app/`), with its exported provider and its notification actions.
- The rule engine (`rules/`) and the contract (`contract/`).
- The parsers and decoders (`pduparse/`, `decoder/`).

Out of scope:

- The phone firmware and the Android telephony stack. Report these to the phone maker or to Google.
- Denial of service that needs root.
- Findings that occur only with a changed APK or a debug build.
- Missing hardening without a demonstrated impact.

## Attack surface

| Entry point | Who can reach it | Controls |
|---|---|---|
| SMS, WAP push and cell broadcast from the network | Anyone who can send to the phone | `pduparse` never throws. Each hook runs inside a catch-all, so a parser failure falls back to Android's own handling. |
| Provider `dev.nightjar.ipc` | Exported, so any app can call it | Answers `null` to any UID except 1001, the phone process. Each batch is limited to 50 events and 256 KiB. |
| Control binder `dev.nightjar.IPayloadControl/1` | Only an app that holds the binder | Rejects calls from any UID except the app UID that the module recorded during `hello`. Rules are limited to 64 KiB and settings to 16 KiB. |
| An app with the package name `dev.nightjar` | An attacker who installs a lookalike | The module compares the app's signing certificate with a pinned SHA-256 hash and sends no message content until they match. |
| Rule regular expressions | The user, or a crafted rules snapshot | `SafeRegex` doesn't backtrack, limits patterns to 200 characters and stops after 50,000 steps. |
| Release and replay | The app | The module refuses types that can't be released, such as SIM updates and cell broadcasts, even if the app asks. |
| App data on the phone | Physical access or a backup | SQLCipher encrypts the database, and cloud backup is excluded. The key is in app-private storage, so a root backup of the app includes it. The module keeps a copy of your rules and settings in device-protected storage, which holds no messages. |

## Design commitments

- The app has no `INTERNET` permission, and the payload has no network code.
- The payload runs inside `com.android.phone` and never throws into it. Each hook fails open.
- Logs, exports and diagnostics mask message text and full phone numbers.
- The app provider accepts calls only from the phone process. The control binder accepts calls only from the app.
- A release build is signed with the release key and never with the debug key.

[Architecture](/NightJar-Postmark/internals/architecture/#trust-boundaries) shows the trust boundaries.
