---
title: Privacy and security
description: What NightJar stores, where it stores it, how it protects the data and how you delete it.
---

## No network access

NightJar has no internet permission, and the module in the phone service has no network code. Data leaves the phone
only when you export it or share a diagnostics file.

## What NightJar stores

| Data | Stored |
|---|---|
| Hidden messages | Yes, with the PDU, the type, what Android did with the message and the hook trace |
| Regular texts your messaging app shows | No. NightJar only counts them. |
| Messages that apps send | Only when Outgoing monitor is on |
| Your rules, presets and settings | Yes |
| Audit history | Yes, a list of the changes you made |

The PDU of a hidden message contains its text, if it has any. NightJar doesn't read Android's SMS database and
doesn't need to be your default SMS app.

## Encrypted database

NightJar keeps its data in a database encrypted with SQLCipher. The key is 32 random bytes in the app's private
storage, which other apps can't read without root. NightJar doesn't log or export the key. A root backup of the app,
for example with Swift Backup, restores a database that still opens on a new ROM.

Messages that arrive before the first unlock after a reboot go to a separate staging store in device-protected
storage, up to 500 messages. The staging store holds PDUs and metadata, not decoded text. After you unlock the phone,
NightJar moves them to the main database.

The module keeps a copy of your rules and settings in the phone service's device-protected storage, so it can block
before you unlock the phone after a reboot. Device-protected storage is encrypted with a key of the device, not your
screen lock. Someone with access to the phone's storage before you unlock could read your rules, for example a number
in a custom rule. The copy holds no messages.

Cloud backup is off, so nothing goes to Google's cloud. A device-to-device transfer copies the encrypted database,
including message content, to the new phone.

## Masking

Logs and diagnostics don't show message text or full phone numbers. NightJar masks them before it writes them.

In the app, you can also:

- Mask phone numbers in lists: Settings > Privacy and security > **Mask numbers in lists**.
- Hide phone numbers in notifications: **Hide numbers in notifications**.
- Mask phone numbers in an export. A masked number keeps the country code and the last three digits, for example
  +91•••••210. Exports leave out message text by default.

## App lock

When you turn on Settings > Privacy and security > **App lock**, NightJar asks for your screen lock when you open it.
**Lock after** sets how long NightJar stays unlocked after you leave it: immediately, 1 minute, 5 minutes (the
default) or 15 minutes. App lock needs a screen lock on the phone.

**Block screenshots** stops Android from taking screenshots of NightJar and hides its content in the recent apps
screen.

## Who can talk to NightJar

- The app accepts events only from the phone process (UID 1001).
- The module accepts commands only from the NightJar app's UID.
- The module checks the app's signing certificate. Until the certificate matches, the module sends no message
  content to the app.

## Root

NightJar uses root to find Vector or LSPosed, restart the phone service and reboot the phone. It doesn't use root
to read your messages.

## Delete your data

| To delete | Do this |
|---|---|
| Old messages | Set Settings > Data and storage > **Keep messages for**: 30 days, 90 days (the default), 365 days or Forever. When you shorten it, NightJar deletes older messages at once. |
| All messages, history and logs | Select **Delete all data** and type DELETE. NightJar keeps your rules and settings. |
| Everything | Uninstall the app. The module's copy of your rules and settings stays in the phone service's storage. |

## Report a security problem

See the [security policy](/NightJar-Postmark/security/).
