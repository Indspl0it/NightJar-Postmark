<p align="center">
  <img src="https://raw.githubusercontent.com/Indspl0it/NightJar-Postmark/main/website/public/favicon.svg" width="96" alt="NightJar logo">
</p>

<h1 align="center">NightJar</h1>

<p align="center">
  <b>An SMS firewall for rooted Android.</b><br>
  NightJar blocks SMS attacks that track your location, take over your SIM card or crash Android,<br> and shows you every hidden message your phone receives.
</p>

<p align="center">
  <a href="https://github.com/Indspl0it/NightJar-Postmark/releases/latest"><img src="https://img.shields.io/github/v/release/Indspl0it/NightJar-Postmark?label=release" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-blue" alt="License: GPL-3.0-or-later"></a>
  <a href="https://indspl0it.github.io/NightJar-Postmark/"><img src="https://img.shields.io/badge/docs-indspl0it.github.io%2FNightJar-5b82e6" alt="Documentation"></a>
</p>

---

Your phone receives SMS that never show up in your messaging app. The network, your carrier, apps on your SIM card and attackers can all send them. Some tell the sender where you are. Some send commands to your SIM card. Some crash the phone service the moment they arrive, without you tapping anything.

NightJar runs inside Android's phone service, the system process that receives SMS from the modem. It checks each message before Android acts on it, blocks the types that attacks use, holds suspicious ones for you to review, and keeps a record of every message with a plain explanation of what it was.

> **Early release (0.5.1).** Install NightJar on a phone you can recover, and read the [blocking cautions](https://indspl0it.github.io/NightJar-Postmark/safety/blocking-cautions/) before you pick a stricter preset.

## What it protects you from

| Attack | What the message does | What NightJar does |
|---|---|---|
| **Silent SMS** (Type 0) | Shows nothing. Your phone confirms it, so the sender learns your phone is on and the network logs your cell. | Records each one and alerts you on a burst, by default 3 within 15 minutes. Android discards silent SMS before NightJar's filter runs, so NightJar can't block them. |
| **Location request** (SUPL) | Asks your phone to report its position to a location server. | Blocks it. During an emergency call and for 5 minutes after, it lets them through so emergency services can find you. |
| **SIM data download** (Simjacker, WIBattack) | Sends a command to an app on your SIM card, for example to text your location to someone. | Blocks it. Rates S@T and WIB browser commands as High, and flags a SIM that sends a message within 10 minutes of an update. |
| **Malformed WAP push and SMS** ([CVE-2026-58882](https://smsofdeath.com)) | A broken header crashes `com.android.phone`. Calls drop, emergency calls too. | Blocks it before Android's parser reads it. With blocking off, it still catches the crash and drops the message, so the phone service keeps running. |
| **Settings push** | Changes your APN or proxy, which can route your mobile data through the sender's server. | Blocks it. |
| **Device management request** | Asks your phone to contact a server that can change the phone remotely. | Blocks it. |

These are the defaults of the Recommended preset, which new installs use. Emergency alerts always reach you. Nothing in NightJar can hold or block them.

## How it works

NightJar is one APK with two parts.

- **The module** runs inside the phone service. Vector or LSPosed loads it at boot. It sees each message before any app does and decides there, from your rules: **Allow**, **Allow and notify**, **Hold** or **Block**. It keeps a copy of your rules, so it protects you from the moment the phone starts, before you unlock it.
- **The app** keeps an encrypted history of every message, explains each one, shows the decoded fields and the path it took through the phone service, runs the attack detectors and sends notifications.

You pick a preset (Monitor, Recommended, Strict or Quarantine), change single message types, or add custom rules for a sender, SIM, port or text. A held message stays in NightJar until you release it to your messaging app or block it.

NightJar also records the SMS that apps on your phone send, and you can stop an app from sending SMS. Google Messages, RCS and your regular texts keep working, and NightJar doesn't need to be your default SMS app.

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/Indspl0it/NightJar-Postmark/main/website/src/assets/screens/home.png" width="200" alt="Home: protection state and messages that need your attention">
  <img src="https://raw.githubusercontent.com/Indspl0it/NightJar-Postmark/main/website/src/assets/screens/messages.png" width="200" alt="Messages: hidden messages with their type and result">
  <img src="https://raw.githubusercontent.com/Indspl0it/NightJar-Postmark/main/website/src/assets/screens/detail.png" width="200" alt="Message detail: a blocked malformed WAP push with its evidence">
  <img src="https://raw.githubusercontent.com/Indspl0it/NightJar-Postmark/main/website/src/assets/screens/protection.png" width="200" alt="Protection: the preset and one action for each message type">
</p>

## Privacy and safety

- **No internet permission.** Nothing leaves your phone unless you export it.
- **Your texts stay yours.** NightJar counts your regular conversations but doesn't store them.
- **Encrypted storage.** The history is in a SQLCipher database, and an optional app lock protects the app.
- **Fails open.** If NightJar's code fails, Android handles the message as if NightJar weren't installed. NightJar never changes what your phone answers the network.
- **Honest limits.** NightJar sees what reaches Android. Messages the modem answers by itself, and RCS chats, are outside its view. See [limitations](https://indspl0it.github.io/NightJar-Postmark/safety/limitations/).

## Requirements

| | |
|---|---|
| Android | 15 or later (API 35+), arm64 |
| Root | Magisk, KernelSU or APatch, with Zygisk (Magisk Zygisk or ZygiskNext) |
| Framework | Vector or LSPosed |
| Networks | GSM, UMTS, LTE and NR SMS, and SMS over IMS. No CDMA. |
| Tested on | Google Pixel 8a (Android 17), OnePlus 13 (OxygenOS 16) |

Other phones can work. Phone makers change the phone service a little, so on an unfamiliar build some hooks may not attach. If the blocking hooks don't load, NightJar only records messages, and the Protection status screen shows which hooks are live.

## Install

1. Download the APK from the [latest release](https://github.com/Indspl0it/NightJar-Postmark/releases/latest). One APK holds both the app and the module.
2. Install it, then open Vector or LSPosed and turn on the NightJar module.
3. Select **Phone Services** (`com.android.phone`) as the only scope.
4. Reboot the phone.
5. Open NightJar. The setup screens check each step.

Every release is signed with the same key. Before you install, check the APK's certificate with an app such as AppVerifier, or with `apksigner verify --print-certs` on a computer:

```text
SHA-256: BA:4C:89:90:1C:27:D3:FB:D6:B1:24:84:2E:B8:0C:BA:A3:E8:D3:AB:E5:F2:A3:B0:69:25:AC:47:8F:1B:13:8A
```

If it doesn't match, don't install the APK. GitHub releases, the LSPosed module repository and F-Droid all ship the APK with this signature, so you can update from any of them.

To update, install the new APK over the old one and reboot. Your rules, settings and history stay.

If calls or messages stop working, turn off the module in Vector or LSPosed and reboot. If the phone can't start, use your root manager's safe mode to turn off Xposed modules. Then [report the problem](https://indspl0it.github.io/NightJar-Postmark/help/troubleshooting/).

## Documentation

The full guide is at **[indspl0it.github.io/NightJar-Postmark](https://indspl0it.github.io/NightJar-Postmark/)**.

- [What NightJar is](https://indspl0it.github.io/NightJar-Postmark/intro/): the attacks in more detail
- [Message types](https://indspl0it.github.io/NightJar-Postmark/features/message-types/): every type NightJar knows, its risk and its actions
- [Detection](https://indspl0it.github.io/NightJar-Postmark/features/detection/): the detectors and their thresholds
- [Blocking cautions](https://indspl0it.github.io/NightJar-Postmark/safety/blocking-cautions/): what can break when you block a type
- [Architecture](https://indspl0it.github.io/NightJar-Postmark/internals/architecture/) and [hooks](https://indspl0it.github.io/NightJar-Postmark/internals/hooks/): how the module works inside the phone service
- [FAQ](https://indspl0it.github.io/NightJar-Postmark/help/faq/) and [troubleshooting](https://indspl0it.github.io/NightJar-Postmark/help/troubleshooting/)

## Build from source

You need JDK 21 and the Android SDK (platforms 36 and 37).

```sh
./gradlew :app:assembleDebug     # debug APK in app/build/outputs/apk/debug/
./gradlew test                   # unit tests
./gradlew verify                 # all quality checks
```

See [building](https://indspl0it.github.io/NightJar-Postmark/dev/building/) for the toolchain and the quality checks, and [release](https://indspl0it.github.io/NightJar-Postmark/dev/release/) for release signing.

| Path | Content |
|---|---|
| `app/` | The app (Kotlin, Jetpack Compose) and the Xposed entry point |
| `payload/` | The code that runs inside `com.android.phone`: hooks, capture, firewall, IPC |
| `contract/` | Wire names, IPC keys and message classes shared by the module and the app |
| `rules/` | The rule engine shared by the module and the app |
| `pduparse/` | PDU, UDH, WSP, WBXML and OTA parser |
| `decoder/` | PDU and cell broadcast decoders for the app |
| `xposed-stubs/`, `hiddenapi-stubs/` | Compile-only API stubs |
| `buildSrc/` | Gradle tasks for the quality checks |
| `testdata/` | Synthetic message scenarios for the unit tests |
| `website/` | The documentation website (Astro and Starlight) |

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open a pull request. To report a security problem, follow [SECURITY.md](SECURITY.md) and don't open a public issue.

## License

NightJar is free software under the GNU General Public License, version 3 or later (GPL-3.0-or-later). See [LICENSE](LICENSE). Third-party notices are in [NOTICE](NOTICE).
