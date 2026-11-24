---
title: Compatibility
description: The phones that NightJar is tested on, and how to report a new build.
---

## Tested phones

| Phone | Software | Notes |
|---|---|---|
| Google Pixel 8a | Android 17 | AIDL radio interface |
| OnePlus 13 | OxygenOS 16 | NightJar adds hooks for the OnePlus SMS service |

## Other phones

When the phone service starts, NightJar finds the methods it hooks by class name, method name and parameter count,
so it doesn't depend on a single build. It can work on other phones with Android 15 or later, on the AIDL or the older
HIDL radio interface.

To check a new phone, install NightJar, run a [self-test](/NightJar-Postmark/guide/self-test/), and open
[Protection status](/NightJar-Postmark/guide/protection-status/). In researcher mode, Protection status lists each hook and its
state.

Each hook has a tier. If a hook doesn't attach, its tier sets the effect:

| Tier | Effect when the hook doesn't attach |
|---|---|
| Capture, required | NightJar can't record messages on this path. |
| Capture, optional | NightJar misses some details or some paths. |
| Meaning | NightJar may not know which app received a message. |
| Firewall, core | NightJar can't block messages. It only records them. |
| Firewall, extra | NightJar can't block some types. |
| Outbound | NightJar can't record some messages that apps send. |

[Hooks](/NightJar-Postmark/internals/hooks/) lists each hook and its tier.

## Phone maker software

Some phone makers add their own SMS service. On some OnePlus and Oppo builds, this service sees a message first, and
NightJar reports the message as "Handled by the phone maker".

On OnePlus, the module adds three hooks: HK-30 on `OplusInboundSmsHandlerImpl.oemCheck`, HK-31 on
`InboundSmsHandler.romDispatchSmsDeliveryIntent` and HK-32 on `OplusSmsBroadcastUndelivered.scanRawTable`. To find
them, the resolver uses the class loader of the OnePlus `mImpl` object. OnePlus has no `sendRawPduForSubscriber`, so
HK-19d doesn't count toward the outbound tier there.

If the phone maker's software deletes a message, the detail shows "Software from the phone maker deleted it".

## Report a build

If NightJar doesn't work correctly on your phone, open an issue on
[GitHub](https://github.com/Indspl0it/NightJar-Postmark/issues) and include:

1. The phone model and the build fingerprint (`adb shell getprop ro.build.fingerprint`).
2. The NightJar version.
3. The root manager, the Zygisk implementation, and the Xposed framework with its version.
4. The diagnostics file from Settings > Diagnostics > **Share diagnostics**.
5. The result of a self-test.

The diagnostics file contains the state of each hook. It contains a list of messages, without message text, only if
you turn on **Include messages**.
