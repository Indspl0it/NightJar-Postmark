---
title: Held messages
description: Find held messages, release them to Android or block them, and the types that can't be held.
---

When a type's action is **Hold**, NightJar keeps each message of that type aside, and no app receives it until you
release it. NightJar stores the message and its PDU in its encrypted database, so a held message stays on hold after
a reboot.

## Where held messages show

- **Home** > Needs attention, with the text "NightJar holds this message until you release or block it."
- **Messages** > **Waiting for you**, at the top of the list, for example "Waiting for you · 2".
- The **On hold** filter in Messages.
- A notification with **Allow** and **Block** actions, if notifications for the type are on. See
  [notifications](/NightJar-Postmark/guide/notifications/#actions).

The message detail shows "On hold in NightJar" as the result.

Messages of the same type from the same sender in the same minute usually show as one row with a count. Held
messages always show one row each, because you release or block each one separately.

## Release a message

1. Select **Release** on the message.
2. Read the dialog "Release this message?". NightJar sends the message to your messaging app as a new message.
3. Select **Release**.

NightJar sends the stored PDU back into the phone service on the SIM that received it, and Android handles the
message as if it had just arrived. If it's a regular SMS, Google Messages shows it. The **Allow** action in a
notification does the same without the dialog.

After the release, the message detail shows "You released it on (date)", and the audit history records the release.

### If the release fails

The message stays on hold, and NightJar shows the reason. After a release from a notification, the reason replaces
the notification.

| Message | What to do |
|---|---|
| The module is not active, so NightJar cannot release the message. | Check the module on [Protection status](/NightJar-Postmark/guide/protection-status/). Release the message again after the module connects. |
| The phone did not answer in time. Try again. | Release the message again. |
| The phone did not accept the message for delivery. | Android refused the message. Try again later, or block the message. |
| The phone did not accept the release request from NightJar. | The module didn't accept the request as coming from the NightJar app. Reboot the phone. If it happens again, [share diagnostics](/NightJar-Postmark/guide/protection-status/#share-diagnostics). |
| NightJar has no copy of this message, so it cannot release it. | NightJar didn't store the PDU. The message can't be released. |
| NightJar cannot release this type of message. | Messages of this type can't be released. Block the message or leave it. |
| NightJar cannot find this message. | The message was deleted. |
| Release is not available yet | NightJar couldn't start the release. Try again. If it happens again, check [Protection status](/NightJar-Postmark/guide/protection-status/). |

## Block a held message

Select **Block** on the message, in the detail, in **Waiting for you** or in the notification. NightJar shows
"Message blocked". The message stays in your history with the result Blocked, counts as blocked on Home and in the
digest, and is never delivered. The audit history records the block.

If you delete a held message instead, NightJar asks first: "You cannot undo this. NightJar will never deliver
messages that are on hold."

## How long held messages stay

Held messages don't expire. The daily cleanup for Settings > Data and storage > **Keep messages for** deletes old messages, but it
skips held and starred messages. A held message stays until you release, block or delete it.

## Types that can't be held

NightJar can hold a type only if it can release the message later. For these types, the **Hold** button shows a lock.
Tap the lock to see "NightJar cannot release this type later, so it cannot hold it."

| Type | Reason |
|---|---|
| SIM update from the network | The exchange with the network ends when the message arrives. |
| Cell broadcast, cell broadcast for the SIM | NightJar can't pass a broadcast to Android a second time. |
| Malformed SMS, malformed WAP push | A second delivery could crash the phone service. |
| Saved to the SIM, delivery report | NightJar has no point where it can stop them. |
| Silent SMS | Android discards it before NightJar can stop it. |
| Voicemail control, missed-call notice, carrier app message, chat (RCS) setup, app-only message, handled by the phone maker | NightJar names these types only after an app received the message. To hold them, set Hold on the type they arrive as, for example Data message to a port. |

The Quarantine preset holds every type that can be held, except regular SMS and emergency alerts. It blocks the
other types or notifies you about them.

## Hold and delivery

Android confirms each message to the network before NightJar holds it, so the sender sees a held message as
delivered. See [blocking cautions](/NightJar-Postmark/safety/blocking-cautions/).
