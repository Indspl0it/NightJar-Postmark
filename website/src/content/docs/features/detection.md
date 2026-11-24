---
title: Detection and severity
description: The severity levels, how NightJar sets the severity of a message, and the trigger and threshold of each detector.
---

NightJar gives each message a severity. The severity sets the colour in the lists and whether you get a
notification.

## Severity levels

| Level | Meaning | Example |
|---|---|---|
| Normal | An expected message | A voicemail indicator or a delivery report |
| Unusual | A type most phones rarely receive | A flash SMS or a smart message |
| Suspicious | A type or pattern that attacks use | A silent SMS from a sender that isn't in Known senders |
| High | A strong sign of an attack | 3 silent SMS from one sender within an hour |

## How NightJar sets the severity

NightJar works out the severity in this order:

1. The default severity of the type, or of the subtype if it has its own. [Message types](/NightJar-Postmark/features/message-types/)
   lists the defaults.
2. Your setting in Settings > **Severity per type**, if you set one.
3. The result of a detector, if one fires. A detector can raise or lower the severity. For example, a location
   request during an emergency call becomes Normal.
4. One level lower if the sender is in [Known senders](/NightJar-Postmark/guide/known-senders/).
5. Normal if the message was sent or added by an app you trust.

Some evidence sets a minimum that steps 2 to 5 can't go below:

- A pattern detector result. A known sender doesn't lower it.
- A subtype with the severity High, such as **Settings push (APN or proxy), no security**. Only your own setting for
  the type, or a location request during an emergency call, lowers it.
- A format error in the PDU makes the message at least Suspicious.
- A malformed message with a damaged WSP header is High.
- A push or port message that NightJar blocked or held, or that no app could receive, is at least Unusual.

The known-sender step doesn't apply to messages added by an app, or to a SIM update without security protection.

When you change a setting that affects severity, NightJar recalculates the severity of stored messages the same way.

## Detectors

A detector looks at a message and the messages before it. When it finds a pattern, it sets the severity and adds a
sentence to the message detail. For a Suspicious or High message the section is **Why NightJar marks this as
suspicious**. For a lower severity it is **Why NightJar flagged it**.

Detectors measure each time window back from the message's arrival time. A burst that continues stays one entry,
and its count grows.

### Silent SMS

| Detector | Trigger | Severity | What you see |
|---|---|---|---|
| Silent SMS burst | Silent SMS from any senders on any SIM reach the burst count within the burst window. Default: 3 within 15 minutes. | Suspicious | "3 silent SMS in 12 minutes from 2 senders." |
| Repeated silent SMS | 3 or more silent SMS from one sender within 60 minutes | High | "Repeated silent SMS can show where a phone is." |
| First-time sender | The first silent SMS from a sender this phone hasn't seen before and that isn't in Known senders | Suspicious | "This is the first silent SMS from a sender that is new to this phone." |
| Unknown sender | A silent SMS from a sender that isn't in Known senders | Suspicious | "The sender is not in Known senders." |
| Roaming | A silent SMS while the phone is roaming | Suspicious | "The phone is roaming, so a silent SMS is more likely to be a location check." |

When the first-time sender detector fires, NightJar doesn't add the unknown sender sentence too.

Settings > Detection has these options:

| Setting | Values | Default |
|---|---|---|
| Silent SMS burst count | 2 to 20 | 3 |
| Burst window | 5, 15, 30 or 60 minutes | 15 minutes |
| Flag first-time senders | On or off | On |
| Flag while roaming | On or off | On |
| SUPL emergency grace | 5 to 60 minutes | 5 minutes |

### Settings and location

| Detector | Trigger | Severity |
|---|---|---|
| Settings push | Any incoming settings push (OMA CP). The detail lists the APN, proxy and server the push tries to set. | Normal if the sender is in Known senders with the label **Carrier**. Suspicious otherwise. |
| Settings push without a network PIN | A settings push with no security or only a user PIN, from a sender that isn't in Known senders | High |
| Location request | A SUPL location request outside an emergency call and its grace time | Suspicious |
| Location request during an emergency | A SUPL location request during an emergency call or within the SUPL emergency grace after it | Normal |
| Location request from an unknown sender | A SUPL request outside an emergency call from a sender that isn't in Known senders with the label **Carrier** | High |

A sender can fake its number, so the **Carrier** label doesn't lower a High subtype such as a settings push with no
security.

### SIM

| Detector | Trigger | Severity |
|---|---|---|
| SIM update without protection | A SIM update with no integrity check and no encryption. "Anyone could have sent it." | Suspicious |
| SIM toolkit target | A SIM update addressed to a SIM app on NightJar's list of apps that SIM-toolkit attacks use. The detail names the app ID. | Suspicious |
| SIM browser command | A SIM update with a command for the S@T or WIB browser on the SIM (Simjacker, WIBattack) | High |
| SIM sends after an update | The SIM sends a message within 10 minutes after a SIM update arrived. This is the Simjacker sequence. | High |

### Ports, formats and apps

| Detector | Trigger | Severity |
|---|---|---|
| Unknown port | 3 or more messages from one sender to an unknown port within 24 hours | Suspicious |
| Malformed burst | 2 or more malformed messages from any senders within 10 minutes | High |
| Replacement without a first message | A replacement message when no earlier message of the same replace type came from the sender | Suspicious |
| Short code | An app or the SIM sends a hidden message to a number with 6 digits or fewer, which can carry a charge | Suspicious |
| Premium number | An app or the SIM sends a hidden message to a number on NightJar's premium-rate list | Suspicious |
| First send | An app sends a hidden message for the first time on this phone. For the SIM, the first message to a destination. | Suspicious |
| Untrusted app adds a message | An app adds a message to your messages, and you don't trust the app | Suspicious |

The malformed burst counts for the whole phone, because a malformed message often has no readable sender.

## Format errors

NightJar checks the structure of each PDU and lists each error under **Anomalies** on the message detail. Some errors
change the type of the message.

| Error | Type it gives the message |
|---|---|
| address cut off, address too long, message too short | Malformed SMS |
| length is more than the data, header length is wrong, header element is too long | Malformed SMS |
| unknown message type | Unreadable SMS |
| unknown WSP type, WSP header length is wrong, content type is unreadable | Malformed WAP push |
| SIM command header is wrong | SIM update from the network |
| unknown address type, unknown protocol identifier, unknown coding scheme | No change |
| data is more than the length, unknown header element, repeated port element | No change |
| port 0, bad multipart numbers, repeated multipart number | No change |
| application ID is unreadable, unknown WBXML version, WBXML string table is wrong, bad WBXML token | No change |

A message with any of these errors is at least Suspicious. A damaged header can crash the phone service on some
phones, so Recommended, Strict and Quarantine block **Malformed SMS** and **Malformed WAP push**.

## Lower the severity for a sender or an app

- **Known senders.** Mark a sender as expected from the message detail, or add it in Known senders. Later messages
  from that sender are one level lower, within the limits above. See [known senders](/NightJar-Postmark/guide/known-senders/).
- **Trusted apps.** NightJar records the messages a trusted app sends or adds as Normal and doesn't notify you about
  them. Trust doesn't apply to messages from the network.

## Notifications

By default, you get a notification for Suspicious and High messages. To get one for Unusual messages too, turn on
Settings > Notifications > **Unusual**. The Strict preset turns it on. See [notifications](/NightJar-Postmark/guide/notifications/).
