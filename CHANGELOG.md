# Changelog

All notable changes to NightJar are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/)
and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.5.1] - 2026-11-16

First public release, licensed under the GNU General Public License, version 3 or later (GPL-3.0-or-later). The
release APK is signed with the NightJar release key, certificate SHA-256
`BA:4C:89:90:1C:27:D3:FB:D6:B1:24:84:2E:B8:0C:BA:A3:E8:D3:AB:E5:F2:A3:B0:69:25:AC:47:8F:1B:13:8A`.

### Added

- Xposed module for Vector and LSPosed with the scope `com.android.phone`. The APK is the module and the app.
- Capture of SMS over CS and IMS, WAP push, SIM data download, cell broadcast, voicemail indications (MWI), sent
  messages and messages that apps add, with the result of each message (shown, delivered to an app, blocked, on hold).
- Firewall with one action for each message type (Allow, Hold, Block), presets, custom rules, known senders and
  trusted apps. Held messages can be released.
- The module keeps a copy of the last rules and settings, so it holds and blocks from boot, before the first unlock.
- Safe mode that pauses blocking. Only the user turns it on or off.
- Decoders for GSM 03.40 TPDUs, UDH, GSM 7-bit alphabets, UCS-2, WSP, WBXML (SI, SL, CO), OMA CP and DM, SUPL, SMS-PP
  and cell broadcast.
- App: encrypted event database, classification, severity, detectors, notifications, Home, Messages, Detail,
  Protection, Protection status, blind spots, settings, export, logs and audit history.
- Self-test with test messages for each class that never reach the default SMS app.

### Security

- No `INTERNET` permission. Cloud backup is off.
- Masking of message text and phone numbers in logs, exports and diagnostics.
- The app provider accepts only the phone process UID. The control binder accepts only the app UID.

## [0.5.0] - 2026-11-16

Tagged, but not released. On a cold start, the app could read its settings a moment before they were loaded. It
could then open without the app lock, and push the default settings, with safe mode off, to the module. 0.5.1 fixes
this.

[0.5.1]: https://github.com/Indspl0it/NightJar-Postmark/releases/tag/v0.5.1
[0.5.0]: https://github.com/Indspl0it/NightJar-Postmark/tree/v0.5.0
