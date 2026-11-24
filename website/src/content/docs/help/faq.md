---
title: FAQ
description: Short answers to common questions about NightJar.
---

## Does NightJar replace my messaging app?

No. Your messaging app receives regular texts as before, and NightJar keeps its own record of the same messages.
NightJar doesn't need to be your default SMS app.

## Does NightJar work without root?

No. The module runs inside the phone service, and only an Xposed framework on a rooted phone can load it there.

## What does NightJar use root for?

NightJar uses root to find Vector or LSPosed and to restart the phone service. It doesn't use root to read your
messages.

## Does NightJar send data to a server?

No. NightJar has no internet permission.

## Does NightJar read my regular texts?

NightJar sees each message in the phone service. For the regular texts that your messaging app shows, it keeps a
count and doesn't store the messages.

## Why does NightJar show silent SMS that I didn't ask for?

Most phones receive some hidden messages. Carriers send them for voicemail, network settings and service checks, so a
silent SMS from your carrier is often normal. To lower the severity of its messages, mark the sender as known. A burst
of silent SMS from an unknown sender is unusual.

## Does NightJar block messages right after a reboot?

Yes. The module keeps a copy of your last rules and settings, including safe mode and the Blocking switch. It uses
that copy as soon as the phone service starts, before you unlock the phone. Android keeps regular SMS that arrive
before the unlock and processes them after it, and NightJar checks them then.

## What happens if the app isn't running?

The module keeps recording in the phone service and holds up to 1,000 events for the app. It sends them when the app
answers again.

## Can NightJar block a silent SMS?

No. Android discards a silent SMS (Type 0) before NightJar can stop it. NightJar records it and can notify you.

## Does the sender know that NightJar blocked a message?

No. NightJar blocks after Android sends the acknowledgement to the network, so the sender sees "delivered".

## Can I get a blocked message back?

No. NightJar keeps the record of a blocked message, but it can't deliver the message. If you want to decide later,
use **Hold** instead of **Block**.

## Does NightJar see RCS chats?

No. RCS chats travel over the internet, outside SMS.

## Can NightJar break my phone?

Each NightJar hook fails open. If NightJar's code fails in the phone service, Android handles the message as usual.
Install NightJar only on a phone that you can recover.

## Can I export my messages?

Yes. You can export a selection, the current filter or everything, as JSON, PDU hex or CSV. You can mask phone
numbers, and the export includes message text only if you choose it. See [export](/NightJar-Postmark/guide/export/).

## Does NightJar work with two SIMs?

Yes. NightJar records the SIM of each message, and a rule can apply to one SIM only.

## What is researcher mode?

Researcher mode shows raw PDUs, the pipeline trace, logs, the audit history, and tools such as the phone service
restart. To turn it on, go to Settings > Appearance > **Mode**.

## Does NightJar support CDMA?

No.
