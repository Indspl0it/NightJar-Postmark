# Contributing

NightJar is a tool for rooted Android phones. A wrong change can break telephony or hide a message that the user
needed. Read this file before you open a pull request.

## Ground rules

- The payload runs inside the phone process. It must never throw, never block the main looper and never change the
  network acknowledgement. Every hook fails open. See the payload rules in
  [architecture](https://indspl0it.github.io/NightJar-Postmark/internals/architecture/#fail-open).
- The app has no `INTERNET` permission. It must not get one.
- Logs, tests, fixtures, commit messages and issues must not contain message text or a full phone number. Use the
  contract masker or synthetic data.
- Contract keys and wire names live in `:contract`. A change there is a protocol change and needs fixtures on both
  sides.
- User-visible text follows the [writing rules](https://indspl0it.github.io/NightJar-Postmark/dev/contributing/#writing-rules).

## Before you send a change

```sh
./gradlew spotlessApply
./gradlew verify
```

`verify` must pass. For a payload change, also include this checklist in the pull request:

```
[ ] every new hook callback runs inside the hook catch-all
[ ] no I/O, binder call, lock or file logging on the main looper or HAL threads
[ ] the filter returns true only after dropFilteredSms
[ ] a missing snapshot means ALLOW
[ ] the hook has a HookCatalog entry with a tier and a not-found behaviour
[ ] a unit test proves that the original result does not change when the hook throws
```

## Adding a hook, class or decoder

- **Hook**: add the `HookSpec` to `HookCatalog`, then a unit test with fakes. See
  [hooks](https://indspl0it.github.io/NightJar-Postmark/internals/hooks/).
- **Class**: update `ClassId`, `EnforcementMatrix`, `ClassRegistry`, the decoder classification and the fixtures.
- **Decoder**: add a golden fixture (`hex` and `expected.json`) and a truncation or mutation case. No Android
  dependencies.

## License of contributions

NightJar is licensed under GPL-3.0-or-later. When you send a change, you agree that it is licensed under the same
license.

## Commits

- Keep each commit to one topic. Write the reason for the change in the commit body.
- Use the [Conventional Commits](https://www.conventionalcommits.org/) form for the subject, for example
  `fix(payload): keep the original result when the WAP hook throws`.

## Reporting

Use the issue templates. A bug report needs the NightJar version (Settings > About), the build fingerprint, the root
manager, the Zygisk implementation, the Xposed framework (Vector or LSPosed) with its version, and a masked
diagnostics bundle. Never paste a real SMS body or a full phone number.

For a security problem, see [SECURITY.md](SECURITY.md).
