---
title: Requirements
description: The phone, root and Xposed framework that NightJar needs.
---

## Phone

| Item | Requirement |
|---|---|
| Android version | Android 15 or later (API 35 or higher) |
| CPU | arm64-v8a |
| Networks | GSM, UMTS, LTE and NR SMS, and SMS over IMS |
| CDMA | Not supported |

## Root and framework

You need all of these:

1. **Root** from Magisk, KernelSU or APatch.
2. **Zygisk**, which Vector and LSPosed run on. Use Magisk with Zygisk turned on, or ZygiskNext.
3. **Vector or LSPosed**, which loads the NightJar module into the phone service.

NightJar uses root to find Vector or LSPosed, restart the phone service and reboot the phone. It doesn't use root to
read your messages.

## Reference phones

Each release is tested on these phones:

| Phone | Software |
|---|---|
| Google Pixel 8a | Android 17 |
| OnePlus 13 | OxygenOS 16 |

Other phones can work. Each phone maker changes the phone service a little, so on an unfamiliar build some hooks may
not attach, and NightJar may not be able to hold or block some message types. If the blocking hooks don't load,
NightJar only records messages.

The [Protection status](/NightJar-Postmark/guide/protection-status/) screen shows the state of each hook on your phone. To
report a new build, see [compatibility](/NightJar-Postmark/help/compatibility/).

## Permissions

| Permission | Used for |
|---|---|
| Notifications | Alerts about suspicious messages and the protection state |
| Run at startup | Checking the protection state after a reboot |
| Biometric | The optional app lock |
| Query all packages | Showing the names of apps that send or receive messages |

NightJar has no internet permission.

## Before you start

:::caution
Install NightJar on a phone you can recover. A problem in the phone service can stop calls and messages. Before you
install, find out how to turn off an Xposed module from your root manager or from recovery.
:::
