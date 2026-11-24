---
title: Notifications
description: The notification channels, what a notification shows, its actions, the rate limit, the weekly digest and the status notifications.
---

NightJar asks for the notification permission during setup. If you deny it, a banner shows "Notifications are off.
NightJar cannot notify you about suspicious messages." NightJar still records messages and applies your actions.

## Which messages notify you

The notification switches are in Settings > **Notifications**:

| Switch | Default | Messages |
|---|---|---|
| Suspicious | On | Messages with the severity Suspicious or High |
| Unusual | Off | Messages with the severity Unusual |
| Broadcast copies | Off | A copy of each cell broadcast |

Messages with the severity Normal don't notify you, unless you turn on the bell for their type.

The bell on a type's row on the [Protection](/NightJar-Postmark/guide/protection/) tab sends a notification for each message
of that type, whatever its severity and whether or not the switches above are on.

The Strict preset turns on **Unusual**. If you change from Strict to another preset, NightJar sets **Unusual** back to
the value it had before.

Some messages never notify you:

- Messages from a sender or type you muted. See [mutes](/NightJar-Postmark/guide/known-senders/#mutes).
- The test messages of the [self-test](/NightJar-Postmark/guide/self-test/).

## What a notification shows

The title names the type and what NightJar did with the message:

| Result | Example title |
|---|---|
| Blocked | Settings push blocked |
| Held | Location request on hold |
| Received | Silent SMS received |
| Sent by an app | Data message sent |

The text says in one sentence what the message did, for example "It tried to change your network settings." When
you expand the notification, it also shows the sender, for example "From +44•••••123". The header shows the carrier
and SIM slot, when NightJar knows them.

A held message has a different text, for example "From +44•••••123. Allow it or block it."

When a detector finds a pattern, such as several silent SMS in a short time, the title names the pattern. Later
messages of the same burst update that notification silently.

Tapping a notification opens the message.

### Privacy on the lock screen

- On the lock screen, a notification shows only "NightJar found a suspicious message" or "NightJar activity".
- Before the first unlock after a reboot, a notification shows "Unlock the phone to see the details."
- To keep phone numbers out of all notifications, turn on Settings > Privacy and security >
  **Hide numbers in notifications**. It's off by default.

## Actions

| Message state | Actions |
|---|---|
| Held, can be released | **Allow**, **Block** |
| Held, can't be released | **Open**, **Block** |
| Blocked | **Open** |
| Received or sent | **Open** |

**Allow** releases the held message to Android. **Block** changes the result to Blocked, so the message is never
delivered. Neither action opens the app.

If a release from a notification fails, NightJar replaces the notification with one that gives the reason, for
example "The phone did not answer in time. Try again. The message is still on hold." The reasons are listed in
[held messages](/NightJar-Postmark/guide/held-messages/#release-a-message).

## Channels

NightJar groups its notifications in six Android channels under the group NightJar. To change the sound,
importance or lock-screen display of a channel, open Settings > Notifications > Frequency and channels >
**System channels**, then select the channel.

| Channel | Importance | Content |
|---|---|---|
| Suspicious messages | High | Suspicious and High messages, detections and messages of types with the bell on |
| Hidden messages | Default | Unusual messages, and Normal messages of types with the bell on |
| Blocking activity | Low | Notices about held messages that NightJar couldn't release |
| Broadcast copies | Low | A copy of each cell broadcast |
| Protection status | Default | Problems with protection |
| Digest | Minimum | The weekly summary |

If you turn off a channel in Android, NightJar doesn't post to it.

## Rate limit

**Notify at most every** sets how often a notification for the same type can sound or vibrate. Choose 1, 5 or 15
minutes. The default is 5 minutes. A notification that arrives sooner still shows, but silently. The setting is in
Settings > Notifications > **Frequency and channels**.

For example, with the default of 5 minutes, if three settings pushes arrive within two minutes, the first one sounds
and the other two show silently.

## Weekly digest

The digest is a quiet weekly summary, for example "Hidden messages: 14. Suspicious: 2. On hold: 1. Blocked: 3."
NightJar posts it at most once every seven days, and only when the week has something to report. Android removes it
from the notification shade after one day. Tapping it opens Messages.

To turn it off, set Settings > Notifications > Frequency and channels > **Digest** to **Off**. The default is
**Weekly**.

## Status notifications

NightJar tells you when protection stops working. Each of these notifications posts once when the problem starts and
goes away by itself when the problem ends. If you swipe it away, it doesn't come back while the same problem
continues.

| Notification | Text |
|---|---|
| NightJar is not active | NightJar cannot see or block messages now. Open NightJar to fix this. |
| NightJar is in safe mode | NightJar records messages but does not block them. |
| NightJar cannot block messages | NightJar records messages but cannot block them on this phone. |
| Update the NightJar app | The module is newer than the app. Update the app to see all details. |

NightJar also checks the phone service every 30 seconds while the app runs. If the phone service restarts and the
module doesn't connect within 20 seconds, NightJar posts "Phone service runs without NightJar. The phone service
started again without the NightJar module. Open Protection status to restart the phone service." See
[restart the phone service](/NightJar-Postmark/guide/protection-status/#restart-the-phone-service).
