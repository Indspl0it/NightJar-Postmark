---
title: Building
description: The toolchain, the Gradle commands, the quality checks, the screenshots and the website build.
---

## Toolchain

| Tool | Version |
|---|---|
| JDK | 21 |
| Android SDK platforms | `android-36` and `android-37.0` |
| Android SDK build tools | `37.0.0` |
| Python | 3, for the test data scripts and the website scripts |
| Node.js | 22 or later, for the website only |
| D2 | 0.9.0, for the diagrams on the website only |

The app compiles against SDK 37, targets SDK 36 and needs at least SDK 35 (Android 15). The plain Java modules
(`payload`, `hiddenapi-stubs`, `xposed-stubs`) compile against the `android.jar` of platform 36, which `njStubSdk` in
`gradle.properties` sets.

Install the SDK packages with `sdkmanager`:

```sh
sdkmanager "platforms;android-36" "platforms;android-37.0" "build-tools;37.0.0"
```

## Environment variables

The build contains no fixed tool paths. Set these variables:

| Variable | Purpose |
|---|---|
| `JAVA_HOME` | The JDK 21 folder |
| `ANDROID_HOME` | The Android SDK folder. You can set `sdk.dir` in `local.properties` instead. |
| `ROBOLECTRIC_MAVEN_REPO` | Optional. The folder for the Robolectric `android-all` jars. The default is `~/.m2`. |
| `NJ_KEYSTORE`, `NJ_KEY_ALIAS` | Optional. The release keystore and key alias. See [release](/NightJar-Postmark/dev/release/). |
| `NJ_KEYSTORE_PASSWORD`, `NJ_KEY_PASSWORD` | Optional. The passwords for release signing. |

`gradle.properties` gives Gradle 4 GB of heap and the Kotlin daemon 2 GB, and turns on parallel builds, the build cache
and the configuration cache. The application ID is `njAppId=dev.nightjar`, and the IPC authority is that ID plus
`.ipc`.

## Gradle commands

```sh
./gradlew :app:assembleDebug        # debug APK
./gradlew :app:assembleRelease      # release APK, signed if the signing variables are set
./gradlew test                      # all unit tests
./gradlew :rules:test --tests "dev.nightjar.rules.RuleEngineTest"   # one test class
./gradlew spotlessApply             # format the code
./gradlew verify                    # all quality checks
```

On Windows, use `gradlew.bat`.

The APKs are in `app/build/outputs/apk/debug/` and `app/build/outputs/apk/release/`. Their file names start with
`NightJar-` and the version name from `version.properties`, for example `NightJar-0.5.1`.

## Quality checks

The `verify` task runs all quality checks, and CI runs it on each pull request. A change is complete only when
`verify` passes and Gradle prints `BUILD SUCCESSFUL`.

| Check | Task | Fails when |
|---|---|---|
| Format | `spotlessCheck` | Kotlin or Gradle files don't match ktlint, or Java files have unused imports, trailing spaces or no final newline. Run `spotlessApply` to fix. |
| Static analysis | `detekt` | Kotlin code in `app` or `decoder` breaks a rule in `config/detekt.yml`. |
| Android lint | `:app:lintDebug` | Lint reports an error. |
| Unit tests | `:app:test`, `:payload:test`, `:contract:test`, `:rules:test`, `:decoder:test`, `:pduparse:test` | A test fails. |
| Contract names | `checkContractLiterals` | A key from `Ipc.java` or `Control.java`, or a wire name of `ClassId`, `Fate`, `AnomalyCode` or `TraceStage`, appears as a literal outside `contract`. |
| Log masking | `checkLogMasking` | A log call passes a text, number or PDU value that isn't wrapped in `Masker`. |
| Payload dex | `:payload:checkPayloadDex` | The payload dex is larger than 300 KB, references a type outside the Android framework, or defines a class outside `dev.nightjar`. |
| Manifest | `:app:checkManifestDebug`, `:app:checkManifestRelease` | The merged manifest declares `INTERNET` or another permission that isn't allowed, cloud backup isn't excluded, or a NightJar provider isn't direct-boot aware. |
| Xposed metadata | `:app:checkXposedMetadataRelease` | The release APK lacks the Xposed meta-data or the `com.android.phone` scope, or `assets/xposed_init` is missing or names a class that isn't in the dex. |
| Release APK size | `:app:checkApkSizeRelease` | The release APK is larger than 15 MiB. |

To accept a log call that the masking check reports, add a `// mask-ok: <reason>` comment on one of its lines. The
check counts lengths and sizes, such as `text.length`, as safe.

The task classes are in `buildSrc/src/main/kotlin/dev/nightjar/build/`.

## Test data

`testdata/scenarios.json` holds synthetic message scenarios for the unit tests. The scripts in `testdata/gen/` create
and check them:

```sh
python testdata/gen/gen_scenarios.py
python testdata/gen/check_scenarios.py
```

All numbers and texts in the test data are synthetic.

## Screenshots

The screenshots on this website come from JVM tests with Roborazzi and Robolectric, so you don't need a phone or an
emulator.

```sh
./gradlew :app:recordRoborazziDebug --tests "dev.nightjar.app.screenshot.DocsScreenshotTest"
python website/scripts/copy_screenshots.py
```

The first command writes the images to `app/build/outputs/docs-screens/`. The second command copies them to
`website/src/assets/screens/`. The images use the sample data of the Compose previews.

## Website

The website is in `website/` and uses Astro with Starlight.

```sh
cd website
npm ci
npm run dev        # local server with live reload
npm run build      # static site in website/dist/
npm run preview    # serve the built site
```

The diagrams are D2 code blocks in the pages. The build calls the `d2` binary, so `d2` must be on `PATH`. The local
address is `http://localhost:4321/NightJar-Postmark/`. The build stops when a page has a broken internal link.

The workflow `.github/workflows/pages.yml` builds the site for each pull request that changes `website/`. When such a
change reaches `main`, the workflow also publishes the site to GitHub Pages. It installs D2 0.9.0 and checks the
SHA-256 hash of the download first.

## CI

The workflow `.github/workflows/ci.yml` runs on each push to `main` and on each pull request:

1. Sets up JDK 21 (Temurin) and the Android SDK, and installs the SDK packages.
2. Runs `./gradlew verify --stacktrace`.
3. Builds the debug APK and uploads it as the build artifact `nightjar-debug-apk`.

A new push to the same branch cancels the run that is in progress. The job stops after 60 minutes.
