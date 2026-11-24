---
title: Message types
description: Each SMS type that NightJar recognises, its use and risk, the actions it supports and the action of each preset.
---

NightJar sorts each message into one of 50 types in 8 groups. The type sets the explanation on the message detail,
the default severity and the actions you can select on the Protection tab. Some types also have subtypes with their
own title and severity, for example **Settings push (APN or proxy), no security**.

## Reading the tables

| Column | Meaning |
|---|---|
| Severity | The default severity. You can change it in Settings > Severity per type. |
| Actions | The actions NightJar can apply to this type. |
| Recommended, Strict, Quarantine | The action of each preset. Monitor allows all types. |

The actions:

- <span class="nj-act nj-act-allow">Allow</span>: NightJar records the message. Nothing else happens.
- <span class="nj-act nj-act-notify">Notify</span>: NightJar records the message and notifies you. In the app, this
  is **Allow** with the bell on.
- <span class="nj-act nj-act-hold">Hold</span>: NightJar keeps the message until you release it or block it.
- <span class="nj-act nj-act-block">Block</span>: NightJar stops the message before any app receives it.

## Unavailable actions

- **No Hold.** NightJar can hold a message only if it can give it back to Android later. SIM updates, cell
  broadcasts and malformed messages can't be given back, so NightJar can only block them.
- **No Hold and no Block.** For some types, Android acts before NightJar can stop the message. Android discards a
  silent SMS (Type 0) before any hook runs. Voicemail control, missed-call notices, carrier messages, chat setup,
  app-only messages and messages handled by the phone maker go to their app first. For these types, NightJar records
  the message and can notify you.
- **Allow only.** NightJar doesn't stop regular texts, delivery reports or messages saved to the SIM by type. A
  [custom rule](/NightJar-Postmark/guide/custom-rules/) with a sender, port or text condition can hold or block a regular
  text.

## Types

### Silent SMS

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| Silent SMS (Type 0) | This message has no text. The phone only sends a confirmation to the network. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Empty message | A message that has no content. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |

- **Silent SMS (Type 0):** a message with protocol identifier 0x40. The phone confirms receipt to the network and
  shows nothing. The sender learns that the phone is on, and the network records the cell it answered from. Law
  enforcement agencies in several countries use silent SMS to locate phones. A Type 0 message sent to a port has its own subtype,
  **Silent SMS (Type 0) to port**, with the severity High, because a Type 0 message normally has no port and an app
  on the phone may receive the data.
- **Empty message:** a message with a normal protocol identifier and coding scheme but no text and no header. The
  phone shows nothing. Like a silent SMS, it can check that a phone is on, but NightJar can block it.

### System

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| Normal message | A normal message with text. | Normal | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> |
| Flash SMS (Class 0) | Shows on the screen. Android does not save it. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Replacement message | Replaces an earlier message in your messaging app. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Delivery report | A delivery report for a message that you sent. | Normal | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> |
| Return call request | Asks you to call a number. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Data download to the phone | Sends data to the phone, not to the SIM. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Phone unlock message (de-personalization) | Tries to unlock the phone from a network. | High | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Message for a connected device (Class 3) | A message for a device that you connect to the phone. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Telematic message | A message for a fax, a pager or a different type of device. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Compressed message | A message with compressed content. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Incomplete multipart message | A long message. Some parts did not arrive. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Malformed SMS | Cut address or too short. It can crash a phone. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> |
| Unreadable SMS | Wrong message type. NightJar cannot check it. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |

- **Flash SMS (Class 0):** the phone shows the text on the screen one time and Android normally doesn't save it.
  Carriers use it for balance notices. An **Empty flash SMS (Class 0)** has no text, shows nothing and has the
  severity Suspicious. Recommended and Strict hold empty flash messages.
- **Replacement message:** the phone replaces an earlier message of the same replace type from the same sender. A
  sender can use it to change a message after you read it. If no earlier message of that type came from the sender,
  a detector rates it Suspicious.
- **Return call request:** protocol identifier 0x5F. It asks you to call the sender.
- **Data download to the phone:** protocol identifier 0x7D. It sends data to the phone software, which can change
  settings with it. Android doesn't show it.
- **Phone unlock message (de-personalization):** protocol identifier 0x7E. It can unlock the phone from a network or
  a SIM. Carriers rarely send it.
- **Message for a connected device (Class 3):** meant for a device connected to the phone, such as a computer.
  Android may show it as a regular text.
- **Telematic message:** the message came through a gateway for fax, telex, paging, voice, ERMES, X.400 or email.
  The subtype names the gateway.
- **Compressed message:** the sender compressed the text. Android can't read compressed text and may show it as
  unreadable characters.
- **Incomplete multipart message:** some parts of a long message didn't arrive within 24 hours, so Android can't
  join them. The parts that arrived were already delivered, so NightJar can only notify you.
- **Malformed SMS:** the PDU has a format error, such as a cut-off address or a message that is too short. The title
  names the error, for example **Malformed SMS: address cut off**. Damaged messages can crash the phone service. See
  [format errors](/NightJar-Postmark/features/detection/#format-errors).
- **Unreadable SMS:** the message type field has a value NightJar doesn't know, so NightJar can't check the message.
  A release works, so the presets hold it.

### Voicemail

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| Voicemail indicator | Turns the voicemail indicator on or off. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Voicemail app control | Controls visual voicemail on your phone. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |

- **Voicemail indicator:** turns the voicemail icon on or off. Subtypes cover fax, email and other waiting
  indicators. A **Silent message-waiting signal** has no text, doesn't change an indicator and tells the phone not to
  keep it. A sender can use it to check that a phone is on. Recommended, Strict and Quarantine block it.
- **Voicemail app control:** controls the visual voicemail app. Android gives it to that app and doesn't show it.

### App messages

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| Missed-call notice | Tells you about a call that you missed. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Carrier app message | A message from your mobile carrier. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Chat (RCS) setup | Configures chat features on your phone. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| App-only message | A code that an app receives by message. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Data message to a port | A message for an app, sent to a data port. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Handled by the phone maker | A message for the software of the phone maker. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-notify">Notify</span> | <span class="nj-act nj-act-notify">Notify</span> |
| Message added by an app | A message that an app added to your messages. | High | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Binary message without a port | A message that has data and no text. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Smart message | Data for the phone, for example a ringtone or a contact card. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Location request (SUPL) | Asks the phone for its location through a data port. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |

- **Missed-call notice:** Android turns it into a missed-call entry and doesn't show a message.
- **Carrier app message:** for the carrier app on your phone. The detail names the app.
- **Chat (RCS) setup:** configures RCS chat features for your number.
- **App-only message:** a message for one app, usually a sign-in code. Your messaging app doesn't show it.
- **Data message to a port:** data for an app, addressed to a port number. The title shows the port number. For standard WAP ports and system service ports, the severity is Unusual. For an
  unknown port or port 0, it's Suspicious. Some apps use data messages, and attackers can use them to track phones or
  probe how a phone handles data. A detector rates 3 messages from one sender to an unknown port within 24 hours as
  Suspicious.
- **Handled by the phone maker:** the phone maker's software handled the message before Android, for example on
  some OnePlus and Oppo builds.
- **Message added by an app:** the message didn't come from the network. An app added it to the phone's SMS system,
  which can make a false message look real. If you trust the app, NightJar rates it Normal.
- **Binary message without a port:** 8-bit data with no port, so no app receives it. Android may show it as an empty
  or unreadable message. A sender can use it to test how a phone handles data.
- **Smart message:** data for a Smart Messaging port: ringtones, operator logos, caller logos, pictures, contact
  cards or calendar entries. Old phones used these ports. Current phones may ignore the data.
- **Location request (SUPL):** data for the SUPL port. A location server can use it to ask the phone for its
  position, and the phone may answer without a notice.

### Push messages

WAP push messages arrive as SMS on the WAP push port and carry a content type that tells Android which app gets them.

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| MMS notification | Tells the phone that a picture message is ready. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Web link push | A push message that opens a web link. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Settings push (APN or proxy) | Tries to change your network settings. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Device management request | Asks your phone to contact a device management server. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Location request | Asks the phone for its location. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Push message | A push message of another type. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Cache control push | A push message that deletes web pages from the browser cache. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Data sync request | Starts a sync of your contacts or calendar. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Email notification | Tells the phone that new email is available. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> |
| DRM licence | Sends the rights for protected media files. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Contact card push | A push message with a contact card or a calendar entry. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Chat service wake-up | A push message for a chat service. | Unusual | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-hold">Hold</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-hold">Hold</span> |
| Malformed WAP push | A push message that NightJar cannot read. | High | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> |

- **MMS notification:** tells your messaging app that a picture message, a delivery report or a read report is
  waiting. The messaging app downloads the MMS itself.
- **Web link push:** a link (Service Indication) that Android doesn't show by default. A **Link deletion push**
  removes an earlier one. An **Auto-open link push** (Service Loading) can open a web page without a tap, has the
  severity High, and Recommended, Strict and Quarantine block it.
- **Settings push (APN or proxy):** an OMA client provisioning message that changes the APN or proxy. An unexpected
  one can route your data through a server someone else controls. The subtype shows how the push is protected:
  network PIN, user PIN, user and network PIN, user PIN with MAC, or no security. A push with **no security** has
  the severity High, because anyone can create one. The detail lists the APN, proxy and server the push tries to
  set.
- **Device management request:** asks the phone to contact a device management server, often the carrier's. The
  server can change settings or install updates. **Device management setup** creates a new management account on
  the phone.
- **Location request:** a SUPL push from a location server. The subtype shows whether the phone tells you, asks you
  first (**Location request (asks you)**) or may answer without telling you (**Silent location request**, severity
  High).
- **Push message:** a push with a content type NightJar doesn't know. Android gives it to the app registered for that
  type, if there is one.
- **Cache control push:** tells the browser to delete pages from its cache.
- **Data sync request:** starts a SyncML sync of contacts or calendar with a server.
- **Email notification:** tells your email app that new email is waiting.
- **DRM licence:** a licence an app uses to play protected media.
- **Contact card push:** a contact card or calendar entry. Android doesn't show these by default.
- **Chat service wake-up:** wakes a Wireless Village chat app.
- **Malformed WAP push:** a push with a damaged WSP header, so NightJar can't read it. The title names the error.
  CVE-2026-58882, the [SMS of Death](https://smsofdeath.com), used a push header length that turns negative to crash
  the phone service. NightJar marks that header as a malformed WAP push.

### SIM messages

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| SIM update from the network | The network sends data to your SIM. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> |
| Saved to the SIM | The network tells the phone to keep the message on your SIM. | Unusual | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-allow">Allow</span> |
| Cell broadcast for the SIM | A broadcast message for your SIM. | Suspicious | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> |

- **SIM update from the network:** protocol identifier 0x7F. The phone passes the message to the SIM. Carriers use
  these updates for roaming lists, keys and SIM services. The subtype shows what the update does:

  | Subtype | Severity |
  |---|---|
  | Changes files on the SIM | Suspicious |
  | Installs or deletes SIM apps | Suspicious |
  | Sends data to a SIM app | Suspicious |
  | Sends a command to the SIM browser (S@T) | High |
  | Sends a command to the SIM browser (WIB) | High |
  | Has no security protection | High |

  The Simjacker attack sends commands to the S@T browser to make the SIM report the phone's location. WIBattack uses
  the WIB browser to make the SIM send messages or open web pages. If you block SIM updates, your SIM may fall out
  of date.
- **Saved to the SIM:** a class 2 message that the phone stores on the SIM. Your messaging app may not show it.
- **Cell broadcast for the SIM:** a cell broadcast with a message identifier in the range for SIM data download. A
  SIM app can use the data to change settings on the SIM.

### Broadcasts

| Type | What it is | Severity | Actions | Recommended | Strict | Quarantine |
|---|---|---|---|---|---|---|
| Cell broadcast | A broadcast message from the network. | Normal | <span class="nj-act nj-act-allow">Allow</span> <span class="nj-act nj-act-notify">Notify</span> <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-allow">Allow</span> | <span class="nj-act nj-act-block">Block</span> | <span class="nj-act nj-act-block">Block</span> |

Strict and Quarantine block other cell broadcasts, but emergency alerts always reach you. The title shows the
channel, for example **Cell broadcast (channel 50)**. See [cell broadcasts](/NightJar-Postmark/features/cell-broadcast/).

### Sent by apps

These types record messages that leave the phone. NightJar doesn't block them by type. To stop an app from sending,
use [Apps that send messages](/NightJar-Postmark/features/outgoing/#block-an-app-from-sending).

| Type | What it is | Default severity |
|---|---|---|
| Message sent by an app | An app sent a message to a number without your messaging app. | Suspicious |
| Hidden message sent by an app | An app sent a message to a number without your messaging app. Android didn't save it. | Suspicious |
| Data message sent | An app sent a data message to a number and port. | Suspicious |
| Raw message sent by an app | An app sent a raw SMS packet to a number. | Suspicious |
| The SIM sent a message | The SIM asked the phone to send a message to a number. | High |
| Voicemail setup message | The phone sent a voicemail setup message to your carrier. | Normal |

## Preset rules for subtypes

For some subtypes, the presets add a rule with a different action than the type:

| Rule | Recommended | Strict | Quarantine |
|---|---|---|---|
| Hold empty flash messages | Yes | Yes | No (Quarantine holds all flash SMS) |
| Block silent message-waiting signals | Yes | Yes | Yes |
| Block auto-open link pushes | Yes | Yes | Yes |
| Hold data messages to port 0 | Yes | No | No |
| Notify me about data messages to unknown ports and configuration ports (5503, 49996, 49999) | Yes | No | No |
| Hold data messages to unknown ports | No | Yes | No |

Strict holds data messages to unknown ports instead of blocking them, because some carriers send voicemail SMS to
an unknown port. You can release a held voicemail SMS.

If the module can't read a subtype, the subtype rule doesn't match and the type's action applies.

## Emergency alerts

NightJar always delivers ETWS and CMAS emergency alerts and records them. No preset or rule can hold or block them.
See [cell broadcasts](/NightJar-Postmark/features/cell-broadcast/).

A location request (SUPL) during an emergency call, or within the grace time after it, always goes to Android, and
NightJar rates it Normal. The grace time is 5 minutes by default. You can set 5 to 60 minutes in Settings >
Detection.
