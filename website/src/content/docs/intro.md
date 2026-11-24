---
title: What NightJar is
description: NightJar is a security and privacy app for rooted Android phones. It blocks SMS attacks that track your location, take over your SIM card or exploit bugs in Android.
---

NightJar is a security and privacy app for rooted Android phones. It protects you from attacks that arrive by SMS:
messages that reveal where you are, commands that take over your SIM card, and malformed messages that crash or
exploit Android without you tapping anything. Most of these messages never appear in your messaging app.

NightJar runs inside Android's phone service and checks each incoming message before Android acts on it. It blocks
the types that attacks use, holds suspicious ones for your review, records every message, and alerts you when it
sees a known attack pattern.

## Location tracking

Your phone answers some messages automatically, and each answer tells the network where the phone is.

- **Silent SMS (Type 0):** your phone confirms receipt and discards the message. Nothing appears on screen. The
  sender learns that your phone is on, and the network logs the cell it answered from. Police and other agencies
  send silent SMS to locate phones. Android discards a silent SMS before NightJar's filter runs, so NightJar can't
  block it. NightJar records each one and alerts you when several arrive in a short time, by default 3 within 15
  minutes.
- **Location requests (SUPL):** ask your phone to report its position to a location server. The Recommended preset
  blocks them. During an emergency call and for 5 minutes after it by default, NightJar lets them through so
  emergency services can find you.

## SIM card attacks

The network can send commands to apps on your SIM card in messages called SIM updates. Carriers use them to update
roaming lists and SIM services. The Simjacker and WIBattack attacks used the same channel: a command to the S@T or
WIB browser on the SIM made it send the phone's location and device ID to the attacker by SMS, with nothing on the
screen.

- The Recommended preset blocks SIM updates.
- NightJar rates a SIM update with an S@T or WIB browser command as High. A SIM update addressed to a SIM app that
  attacks use is Suspicious, and the message detail names the app.
- If the SIM sends a message within 10 minutes after a SIM update arrived, NightJar marks it High. This is the
  Simjacker sequence.

## Malformed messages and zero-click bugs

The phone service parses every incoming SMS as soon as it arrives, with no action from you. A parser bug there is a
zero-click bug: one message is enough to trigger it.

In October 2026, Google patched CVE-2026-58882, the [SMS of Death](https://smsofdeath.com). A single WAP push with a
header length that turns negative crashes `com.android.phone`, and active calls drop, emergency calls too. Recovering
the phone needs a computer and ADB. Android 12 to 17 are affected. The October 2026 security update fixes Android 14
to 17 only.

NightJar parses each message with its own parser before Android does. The parser never throws on bad input.

- The Recommended preset blocks malformed WAP pushes before Android's WAP push parser reads them, and blocks
  malformed SMS. NightJar marks the negative header length of CVE-2026-58882 as a malformed WAP push.
- If you turned off blocking, NightJar still catches the parser crash in the WAP push handler and drops the message,
  so the phone service keeps running.
- Two or more malformed messages within 10 minutes raise a High alert.

## Remote configuration changes

- **Settings push:** changes your mobile data settings, such as the APN or proxy. An unexpected one can route your
  traffic through the sender's server. The Recommended preset blocks it. A settings push from a sender you marked as
  your carrier is rated Normal.
- **Device management request:** asks your phone to contact a device management server, which can change the phone
  remotely. The Recommended preset blocks it.

[Message types](/NightJar-Postmark/features/message-types/) lists every type NightJar knows, with its risk and the actions
available for it.

## How NightJar works

NightJar ships as one APK with two parts:

- The **module** runs inside the phone service, the system process that receives SMS from the modem. Vector or
  LSPosed loads it at boot. The module sees each message before any app does and holds or blocks it there.
- The **app** keeps an encrypted history of every message, explains each one, runs the detectors, sends
  notifications and stores your settings and rules.

Google Messages, RCS and regular texts work as before, and NightJar doesn't need to be your default SMS app.
NightJar also records the SMS that apps on your phone send, including messages sent without your messaging app. See
[Outgoing messages](/NightJar-Postmark/features/outgoing/).

## The app

| Tab | What it shows |
|---|---|
| [Home](/NightJar-Postmark/guide/home/) | Whether protection is working, messages that need your attention, and counts of hidden, suspicious, held and blocked messages. |
| [Messages](/NightJar-Postmark/guide/messages/) | Every recorded message with its type and severity. The detail screen explains the message, shows a timeline of what happened to it, and can show the raw data. |
| [Protection](/NightJar-Postmark/guide/protection/) | The preset and the action of each type, custom rules, known senders, the status of the module, and what NightJar can't see. |
| [Settings](/NightJar-Postmark/guide/settings/) | Notifications, detectors, data retention, export, logs, and the apps that send SMS from your phone. |

## Actions

| Action | What happens |
|---|---|
| Allow | The message is recorded and delivered as usual. |
| Allow and notify | The same as Allow, and you get a notification. |
| Hold | The message is kept aside until you release or block it. |
| Block | The message is discarded before any app receives it. |

New installs use the Recommended preset. You can change to a stricter [preset](/NightJar-Postmark/guide/protection/), set
single types on the Protection tab, or add [custom rules](/NightJar-Postmark/guide/custom-rules/) for specific senders.

## Privacy and safety

- NightJar has no internet permission. Nothing leaves your phone.
- NightJar counts your regular text conversations but doesn't store them.
- Emergency alerts always reach you. Nothing in NightJar can hold or block them.
- If NightJar's code fails, Android handles the message as if NightJar weren't installed.
- After a reboot, NightJar applies your last rules as soon as the phone service starts, before you unlock the phone.
- NightJar sees only what reaches Android. Messages that the modem answers by itself, and RCS chats, are outside
  its view. See [Limitations](/NightJar-Postmark/safety/limitations/).

## Get started

1. Check the [requirements](/NightJar-Postmark/requirements/): a rooted phone with Android 15 or later, and Vector or LSPosed.
2. [Install NightJar](/NightJar-Postmark/install/).
3. Read the [blocking cautions](/NightJar-Postmark/safety/blocking-cautions/) before you change to a stricter preset.
