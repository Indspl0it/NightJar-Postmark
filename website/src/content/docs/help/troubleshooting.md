---
title: Troubleshooting
description: Common problems with NightJar and the steps to fix them.
---

Most problems show on [Protection status](/NightJar-Postmark/guide/protection-status/), which you open from Home. Each check
there has a short fix text. The sections below add the cause of each problem.

## The module

### "NightJar is not active"

The module didn't start in the phone service during this boot.

1. Open Vector or LSPosed.
2. Make sure that the NightJar module is on.
3. Make sure that the scope includes Phone Services (`com.android.phone`).
4. Reboot the phone.

After each change to the module or its scope, reboot once. Protection status shows the module as "Off" when it is
turned off in Vector or LSPosed.

### "NightJar does not support this build"

The module didn't find a hook it needs to record messages: HK-06, HK-04, or both HK-01 and HK-01b. It removed all
its hooks and stopped itself. Android works as if NightJar weren't installed.

1. Open Settings > Diagnostics and select **Share diagnostics**.
2. Open an issue on [GitHub](https://github.com/Indspl0it/NightJar-Postmark/issues) and attach the file.

For the tested phones and the hook tiers, see [compatibility](/NightJar-Postmark/help/compatibility/).

### "NightJar cannot block messages on this build"

One of the hooks for blocking (HK-24, HK-14 or HK-15) didn't attach. NightJar still records messages and can still
notify you, but it can't hold or block.

1. Turn on researcher mode in Settings > Appearance > **Mode**.
2. Open Protection status and look at **Hooks**.
3. Share diagnostics in an issue.

A hook can also stop during a session. If a hook throws more than 20 times, the module removes it.

### "Phone service runs without NightJar"

The phone service restarted, and the module didn't load. NightJar doesn't record new messages until the module loads.

1. Open Protection status.
2. Select **Restart phone service**, then **Restart**. Calls disconnect.

You can't restart the phone service during a call, while the phone rings, or in safe mode. A reboot also loads the
module.

### "The module is newer than the app"

The phone service still runs a module from an APK that you replaced, or you installed an older APK.

1. Install the latest NightJar APK.
2. Reboot the phone.

### "Check again after the update"

Your phone installed a system update, and the update may have changed the phone service.

1. Run a self-test.
2. Open Protection status. In researcher mode, look at **Hooks**.

Blocking stays on. If a hook doesn't attach on the new build, NightJar can't hold or block some types until a
NightJar update supports the build.

## Rules

### "The phone service uses older rules"

The phone service didn't receive your latest rules, for example because the module wasn't connected when you saved
them.

1. Open Protection status.
2. Select **Refresh**.
3. If the rules are still old, reboot the phone.

### "NightJar cannot use the rules"

The phone service rejected the last rules snapshot and kept the rules it had before. Select **Refresh**. If the problem
stays, share diagnostics.

### "The phone service cannot use some rules"

The phone service skips a rule that it can't evaluate correctly, for example a rule with a condition that this module
version doesn't know. It applies all other rules. If you updated NightJar, reboot the phone so that the module and the
app have the same version.

### Nothing is blocked right after you install NightJar

The module gets its first rules when the app connects to it after the reboot that activates the module. Until then,
it allows each message and only records it. From then on, the module keeps a copy of your rules and uses it after
every reboot. If that copy can't be read, the module allows each message until the app sends the rules again.

A regular SMS that arrives before the first unlock after a reboot shows "Android will process this after you unlock
the phone". Android keeps it until the unlock, and NightJar checks it then.

## Messages

### Messages stays empty

Most phones receive a few hidden messages each day from voicemail and the carrier. If Messages stays empty:

1. Open Protection status and make sure that the module is active.
2. Run a [self-test](/NightJar-Postmark/guide/self-test/).
3. If the self-test passes, the phone hasn't received a hidden message yet.

The self-test checks detection inside Android. It can't test messages that the modem handles without telling
Android. A type marked "Not seen yet" may not have arrived, or the modem may handle it.

### Messages may be missing

If **Module events** on Protection status shows lost events, the module couldn't give some events to the app.

- The module keeps up to 1,000 events, or 4 MB, that the app hasn't confirmed. If the app doesn't answer for a long
  time, the module drops the oldest events.
- A burst of messages can fill the module's queue of 4,096 observations. The module drops new observations then,
  because hook threads never wait.

The module sends events again when the app answers, so a short app stop loses nothing.

### A message that you need didn't arrive

1. Open Messages and select the **On hold** chip.
2. If the message is on hold, select **Release**.
3. If NightJar blocked it, open the detail. **What happened** shows the rule or the preset action that blocked it.
4. Change the action of the type, or add a [custom rule](/NightJar-Postmark/guide/custom-rules/) that allows the sender.

To stop all blocking while you check, turn on safe mode. A blocked message can't come back. Use **Hold** for types
that you want to review first.

### A release fails

The message stays on hold after each of these errors.

| Message | Cause |
|---|---|
| "The module is not active, so NightJar cannot release the message." | The module isn't loaded in this boot. |
| "NightJar cannot release this type of message." | The type can't be given back to Android, for example a SIM update. |
| "NightJar has no copy of this message, so it cannot release it." | The stored PDU is missing. |
| "The phone did not answer in time. Try again." | Android didn't confirm a part within 10 seconds. |
| "The phone did not accept the message for delivery." | The phone service had no SMS dispatcher to take the message. |
| "The phone did not accept the release request from NightJar." | The module rejected the request, because it didn't recognize the app as the caller. |

## Self-test

| Message | Fix |
|---|---|
| "Unlock your phone. Then run the self-test." | Unlock the phone. The self-test can't run before the first unlock. |
| "A self-test is already running." | Wait for the running test to end, or cancel it. |
| "Select at least one type." | Select a message type to test. |
| "The module is not running in this boot." | Turn on NightJar in Vector or LSPosed with the scope Phone Services, then reboot. |

A test shows "Skipped" when the hook it needs isn't active on this phone.

## Calls or messages stop after the install

1. Open Vector or LSPosed.
2. Turn off the NightJar module.
3. Reboot the phone.
4. Open an issue. Include the build fingerprint and a diagnostics file.

If the phone can't start, use the safe mode of your root manager to turn off all modules.

## Root access

If Protection status says "NightJar cannot check root access", open your root manager (Magisk, KernelSU or APatch) and
allow NightJar. Then select **Refresh**. NightJar uses root to find Vector or LSPosed and to restart the phone service.

## Report a bug

Include:

- The NightJar version (Settings > About).
- The build fingerprint (`adb shell getprop ro.build.fingerprint`).
- The root manager, the Zygisk implementation, and the Xposed framework with its version.
- A diagnostics file.

Don't paste real message text or a full phone number in an issue.
