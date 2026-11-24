---
title: Blocking cautions
description: What a block does and doesn't do, which services a block can stop, and how to stop all blocking.
---

:::caution
A block can stop a message you need, such as a voicemail notice or a carrier settings update. Check the types below before you change the preset or add a blocking rule.
:::

## The sender sees "delivered"

NightJar acts after Android confirms the message to the network, and it doesn't change that confirmation. The
sender sees "delivered", the network doesn't send the message again, and the sender can't tell that a filter is
active. A blocked message is gone for the apps on your phone, but the network and the sender have no record of the
block.

## Emergency alerts always get through

ETWS and CMAS cell broadcasts always go to Android. A location request (SUPL) during an emergency call, or within the
grace time after it, also goes to Android. The grace time is 5 minutes by default, and you can set 5 to 60 minutes in
Settings > Detection. No preset or rule can change this.

## Blocks that can stop a service

| If you block | This can stop |
|---|---|
| SIM update from the network | Roaming lists, keys and services your carrier sends to the SIM |
| Voicemail indicator | The voicemail icon |
| MMS notification | Picture messages. Your messaging app doesn't learn about a new MMS. |
| Data message to a port | Apps that receive data by SMS, including some carrier voicemail services |
| Device management request | Carrier settings and updates over the air |
| Location request (SUPL) | Assisted GPS location outside an emergency call |

NightJar asks before two kinds of block:

- **Block SIM updates?** "NightJar will block SIM updates from the carrier, for example roaming lists, keys and
  services. The network still gets a normal confirmation."
- **This may break Voicemail indicator.** "If NightJar blocks this type, Voicemail indicator does not work as
  intended. Calls and normal messages still work."

## Regular texts

A rule can't hold or block all regular texts. If you try, NightJar shows "Cannot block all normal messages" and asks
you to add a sender, port or text condition.

Don't block your bank, delivery services or two-factor senders unless you have another way to get their codes. Add
them to [known senders](/NightJar-Postmark/guide/known-senders/) instead.

## Later filters don't see a blocked message

NightJar decides at the first filter in the phone service. When it blocks a message there, the voicemail filter, the
carrier filter and the apps after it don't see the message.

## Hold isn't available for every type

NightJar can hold a message only if it can give it back to Android later. For SIM updates, cell broadcasts, malformed
messages and some other types, NightJar can only block. See [held messages](/NightJar-Postmark/guide/held-messages/).

When you block a held message, you can't undo it: NightJar never delivers it.

## Rules after a reboot

The module keeps a copy of your last rules and uses it after a reboot or a phone service restart, also before you
unlock the phone. Right after you install NightJar, the module has no rules until the app sends them for the first
time. It allows each message in that time and only records it.

## Stop all blocking

- **Safe mode** pauses all blocking. NightJar keeps recording. Turn it on from Home or Settings > Diagnostics.
- The **Blocking** switch on the Protection tab turns blocking off.
- The **Monitor** preset blocks nothing.

NightJar doesn't turn on safe mode by itself.
