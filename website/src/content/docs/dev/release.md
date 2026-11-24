---
title: Release
description: The NightJar release key, how to make a signed release, and how the release reaches GitHub, the LSPosed module repository and F-Droid.
---

## Version

`version.properties` holds one version for the app, the module and the payload:

```properties
versionName=0.5.1
versionCode=6
```

Increase `versionCode` by one for each release. `versionName` follows [Semantic Versioning](https://semver.org/).

## Release key

One key signs every release, on every channel:

| Field | Value |
|---|---|
| Alias | `nightjar` |
| Type | RSA 4096, PKCS12 keystore |
| Certificate | `CN=NightJar`, valid until 2056 |
| SHA-256 | `BA:4C:89:90:1C:27:D3:FB:D6:B1:24:84:2E:B8:0C:BA:A3:E8:D3:AB:E5:F2:A3:B0:69:25:AC:47:8F:1B:13:8A` |

The maintainer keeps the keystore offline and signs on their own computer. The key is never in the repository or in
CI. CI builds and tests the release without signing it.

If the key is lost, no installed copy can be updated, because Android only installs an update signed with the same
key. Keep two offline backups of the keystore and keep its password in a password manager.

## Signing material

The release key is never in the repository. The build reads it from these sources:

| Value | Source |
|---|---|
| Keystore path | `NJ_KEYSTORE`, or `nj.keystore` in `local.properties` |
| Key alias | `NJ_KEY_ALIAS`, or `nj.keyAlias` in `local.properties` |
| Keystore password | `NJ_KEYSTORE_PASSWORD` |
| Key password | `NJ_KEY_PASSWORD` |

The passwords come only from environment variables, so no secret goes into a file. Git ignores `local.properties`,
`*.keystore` and `*.jks`.

If a value or the keystore file is missing, the release APK stays unsigned. When you set the keystore path or the key
alias but not everything else, Gradle prints a warning that names what is missing:

```text
Release signing material is not complete. The release APK stays unsigned. Missing: NJ_KEY_PASSWORD
```

The warning never shows a value, and a release build never uses the debug key.

## What the release build does

- R8 shrinks and optimizes the code (`isMinifyEnabled`) and removes unused resources (`isShrinkResources`).
- The APK contains native libraries for `arm64-v8a` only and resources for English only.
- The APK file name is `NightJar-<versionName>`, for example `NightJar-0.5.1`.

## Procedure

1. Update `version.properties`.
2. Add a section for the new version to `CHANGELOG.md`, and a short version of it, at most 500 characters, to
   `fastlane/metadata/android/en-US/changelogs/<versionCode>.txt`. F-Droid shows that file.
3. Run all quality checks:

   ```sh
   ./gradlew verify
   ```

4. Commit, make an annotated tag, for example `v0.5.1`, and push `main` and the tag.
5. Build the unsigned release from a clean clone of the tag:

   ```sh
   git clone --branch v0.5.1 https://github.com/Indspl0it/NightJar-Postmark.git nightjar-v0.5.1
   cd nightjar-v0.5.1
   ./gradlew :app:assembleRelease
   ```

6. Check that the APK is the same as the one the **Release check** workflow built for the tag. Download the
   `nightjar-release-unsigned` artifact from the workflow run. Both files must have the same SHA-256:

   ```sh
   sha256sum app/build/outputs/apk/release/NightJar-0.5.1-release-unsigned.apk NightJar-0.5.1-release-unsigned.apk
   ```

   If they differ, F-Droid's build won't match either. Find the cause before you continue.

7. Sign the APK with the release key, on your own computer:

   ```sh
   apksigner sign --ks nightjar-release.jks --ks-key-alias nightjar \
     --v1-signing-enabled false --alignment-preserved true \
     --out NightJar-0.5.1-release.apk app/build/outputs/apk/release/NightJar-0.5.1-release-unsigned.apk
   apksigner verify --print-certs NightJar-0.5.1-release.apk
   ```

   The line with `certificate SHA-256 digest` must show
   `ba4c89901c27d3fbd6b124842eb80cbaa3e8d3abe5f2a3b06925ac478f1b138a`.

   F-Droid copies this signature onto its own build with [apksigcopier](https://github.com/obfusk/apksigcopier) and
   verifies the result, and both options are needed for that. Android 15 and later ignore the v1 (JAR) signature, and
   apksigcopier can't read how apksigner compresses its files. Without `--alignment-preserved`, apksigner changes the
   zip layout, and the signature no longer fits F-Droid's build. Check it with:

   ```sh
   apksigcopier compare NightJar-0.5.1-release.apk --unsigned NightJar-0.5.1-release-unsigned.apk
   ```

8. Write the checksum:

   ```sh
   sha256sum NightJar-0.5.1-release.apk > SHA256SUMS
   ```

9. Make a GitHub release for the tag. Attach `NightJar-0.5.1-release.apk` and `SHA256SUMS`, and copy the changelog section
   into the release notes.
10. Publish the same APK as a release in the LSPosed module repository, `Xposed-Modules-Repo/dev.nightjar`.
11. F-Droid finds the new tag by itself. It builds the tag, checks that its APK matches the one on GitHub, and then
    publishes the GitHub APK with its signature.

## Reproducible build

F-Droid builds each tag from source and compares the result with the signed APK on GitHub, without the signature. It
publishes the version only when the two match, so the release must come out the same on any computer:

- Build from a clean clone of the tag, as in the procedure. Local changes, other branches and old build output change
  the APK.
- Use JDK 21. Gradle downloads the same Gradle, Android Gradle plugin, Kotlin and library versions on every
  computer, because the wrapper and the version catalog pin them.
- The release APK leaves out the dependency metadata block of the Android Gradle plugin. F-Droid rejects APKs that
  carry it.

## Checks on the release APK

`verify` includes these checks for the release variant:

| Task | Fails when |
|---|---|
| `checkManifestRelease` | The manifest declares `INTERNET` or another permission that isn't allowed, cloud backup isn't excluded, or a NightJar provider isn't direct-boot aware. |
| `checkXposedMetadataRelease` | The Xposed meta-data or the `com.android.phone` scope is missing, or `assets/xposed_init` is missing or names a class that R8 removed. |
| `checkApkSizeRelease` | The APK is larger than 15 MiB. |

Before you publish, install the APK on a test phone and run a [self-test](/NightJar-Postmark/guide/self-test/).
