---
title: Contributing
description: The rules for a change to NightJar, the checklist for payload changes and the writing rules.
---

NightJar runs inside the phone service of a rooted phone. A wrong change can stop calls and messages, or hide a
message that the user needed.

## Basic rules

- The payload runs inside `com.android.phone`. It must never throw, never block the main looper and never change the
  network acknowledgement. Each hook fails open. See [architecture](/NightJar-Postmark/internals/architecture/#fail-open).
- The app has no `INTERNET` permission, and `checkManifestDebug` and `checkManifestRelease` fail if a change adds it.
- Logs, tests, fixtures, commit messages and issues must not contain message text or a full phone number. Use the
  contract masker or synthetic data. `checkLogMasking` finds unmasked log calls.
- Contract keys and wire names are in `contract`. A change there is a protocol change and needs fixtures on both
  sides.
- User-visible text follows the [writing rules](#writing-rules).

## Before you send a change

```sh
./gradlew spotlessApply
./gradlew verify
```

`verify` must end with `BUILD SUCCESSFUL`. [Building](/NightJar-Postmark/dev/building/) lists each check and what makes it
fail.

## Pull requests

The pull request template asks you to confirm that:

- `./gradlew verify` passes.
- No message text and no full phone number are in the code, tests, fixtures, logs or the description.
- User-visible text follows the writing rules.
- A change in `contract` has fixtures on both sides.

For a change in `payload/`, the template adds this checklist:

```text
[ ] every new hook callback runs inside the hook catch-all
[ ] no I/O, binder call, lock or file logging on the main looper or HAL threads
[ ] the filter returns true only after dropFilteredSms
[ ] a missing snapshot means ALLOW
[ ] the hook has a HookCatalog entry with a tier and a not-found behaviour
[ ] a unit test proves that the original result does not change when the hook throws
```

## Add a hook

1. Add a `HookSpec` to `payload/src/main/java/dev/nightjar/payload/hook/HookCatalog.java`. Give it an ID, a tier, a
   kind (`BEFORE`, `AFTER` or `AROUND`), the target class and method, the parameter types or the parameter count, and the
   resolver to use.
2. Write the callback so that it does no I/O, binder calls, JSON work or lock waits. The `Hooker` catch-all wraps it.
3. Define what happens when the target isn't found, and check that the tier rules in `TierManager` still hold.
4. Add a unit test with fake framework classes. The test must prove that the original result doesn't change when the
   hook throws.

[Hooks](/NightJar-Postmark/internals/hooks/) describes the resolver, the tiers and the callback rules.

## Add a message type

Update all of these together:

- `ClassId` in `contract`.
- `EnforcementMatrix` in `rules`: the class actions, the rule actions and whether the type is releasable.
- `ClassRegistry` in `app/src/main/java/dev/nightjar/app/domain/`.
- The decoder classification.
- The fixtures.

## Add a decoder case

The decoder fixtures are in `decoder/src/test/resources/corpus/`, in folders such as `tpdu`, `udh`, `wsp`, `wbxml`,
`oma_cp`, `oma_dm`, `supl`, `sms_pp` and `cb`. Each case is a `.hex` file with the input and an `.expected.json` file
with the decoded result. Add a truncation or mutation case too. The decoder must not have Android dependencies.

## Writing rules

These rules apply to text in the app: labels, error messages, status text and numbered steps. They follow Simplified
Technical English (ASD-STE100).

- Use the active voice.
- Write one instruction in each sentence.
- Use at most 20 words in an instruction and 25 words in a description.
- Don't use semicolons.
- Don't use phrasal verbs such as "set up" in prose. Use one verb, such as "install".
- Don't use marketing words. Give a measurement instead.
- Use one term for one idea. For example, write "hold" for the action that keeps a message back. The preset name
  "Quarantine" is the only exception.
- Don't show a value that the app doesn't know. Write "Not known" or hide the field.

The documentation uses plain sentences addressed to "you". Labels on this website use the same words as the app, so
you can find them on the screen.

## Commits

- Keep each commit to one topic, and write the reason for the change in the commit body.
- Use the [Conventional Commits](https://www.conventionalcommits.org/) form for the subject, for example
  `fix(payload): keep the original result when the WAP hook throws`.

## Report a problem

Use the bug or feature issue template on GitHub. A bug report needs:

1. The NightJar version (Settings > About).
2. The build fingerprint.
3. The root manager, the Zygisk implementation, and the Xposed framework (Vector or LSPosed) with its version.
4. The diagnostics file from Settings > Diagnostics > **Share diagnostics**.

Don't paste real message text or a full phone number. For a security problem, see the
[security policy](/NightJar-Postmark/security/).
