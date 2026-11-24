## What this change does

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] `./gradlew verify` passes.
- [ ] No message text and no full phone number in code, tests, fixtures, logs or this description.
- [ ] User-visible text follows the [writing rules](https://indspl0it.github.io/NightJar-Postmark/dev/contributing/#writing-rules).
- [ ] A change in `:contract` has fixtures on both sides.

## Payload changes only

- [ ] Every new hook callback runs inside the hook catch-all.
- [ ] No I/O, binder call, lock or file logging on the main looper or HAL threads.
- [ ] The filter returns true only after `dropFilteredSms`.
- [ ] A missing snapshot means ALLOW.
- [ ] The hook has a `HookCatalog` entry with a tier and a not-found behaviour.
- [ ] A unit test proves that the original result does not change when the hook throws.
