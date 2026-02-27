<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[78f81ab](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/78f81ab8deeb1249f50bf2f75dd4860cd4fc05f0)...
[78f81ab](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/78f81ab8deeb1249f50bf2f75dd4860cd4fc05f0)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/78f81ab8deeb1249f50bf2f75dd4860cd4fc05f0...78f81ab8deeb1249f50bf2f75dd4860cd4fc05f0))


### 📦 Dependencies

- *(deps-dev)* [dependency] Update minimatch [`(78f81ab)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/78f81ab8deeb1249f50bf2f75dd4860cd4fc05f0)






## [1.6.8] - 2026-02-27


[[d7ed464](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d7ed464350abb587fc0e64fd2d2325c40faa037f)...
[6904e41](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/6904e4186c150ee48121cfbb48565c23ef181b23)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/d7ed464350abb587fc0e64fd2d2325c40faa037f...6904e4186c150ee48121cfbb48565c23ef181b23))


### 🚜 Refactor

- 🚜 [refactor] streamline publish flow and add ESLint loader

👷 [ci] drop release.yml, narrow Node matrix to 20/22, harden manual-publish job and update workflows docs
 - introduced artifact checks, commit package-lock, treat manual dispatch as recommended
 - removed GitHub release trigger from docs and workflow readme

🧹 [chore] add `dist/` to .gitignore, bump engine to Node >=20, adjust deps
 - move ESLint to peerDependencies, update dev dependencies versions

🚜 [refactor] implement runtime ESLint loader with friendly missing-peer error
 - use loader in FileScanner and ESLintChunker
 - add tests covering loader success, peer‑dep error, and generic failures

🎨 [style] rework ESLint config: use `defineConfig`, apply global ignores, update prettier import

🧪 [test] add eslintLoader test file

🔧 [build] expand tsconfig excludes to include test directory

📝 [docs] mention Node 20+ requirement and rewrite publishing instructions in README and PUBLISHING.md

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d7ed464)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d7ed464350abb587fc0e64fd2d2325c40faa037f)



### 🧹 Chores

- [dependency] Update version 1.6.8 [`(6904e41)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/6904e4186c150ee48121cfbb48565c23ef181b23)






## [1.6.7] - 2026-02-23


[[bbec3f0](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/bbec3f01affc073d8df5a1ad57f18cea1742796b)...
[28b5a64](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/28b5a6457fcaa522e5d7f415d17fb5d5e418622b)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/bbec3f01affc073d8df5a1ad57f18cea1742796b...28b5a6457fcaa522e5d7f415d17fb5d5e418622b))


### 🧹 Chores

- [dependency] Update version 1.6.7 [`(28b5a64)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/28b5a6457fcaa522e5d7f415d17fb5d5e418622b)



### 🔧 Build System

- 🔧 [build] [dependency] Update version 1.6.6 in package.json and package-lock.json
 - Updated version from 1.6.5 to 1.6.6 in package.json
 - Updated version from 1.6.4 to 1.6.6 in package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bbec3f0)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/bbec3f01affc073d8df5a1ad57f18cea1742796b)






## [1.6.5] - 2026-02-23


[[3c642e8](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/3c642e816d36bac0070b97d53951cc6628b5e31c)...
[8de2d8d](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/8de2d8dfd439ba235a335c0059d152732cbefbc4)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/3c642e816d36bac0070b97d53951cc6628b5e31c...8de2d8dfd439ba235a335c0059d152732cbefbc4))


### 🧹 Chores

- [dependency] Update version 1.6.5 [`(8de2d8d)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/8de2d8dfd439ba235a335c0059d152732cbefbc4)






## [1.6.4] - 2026-02-23


[[496e59b](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/496e59bed36208d6a373934a7b63fbbd3b157fdb)...
[14271d5](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/14271d502f23152ea551c889a020453d412897c9)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/496e59bed36208d6a373934a7b63fbbd3b157fdb...14271d502f23152ea551c889a020453d412897c9))


### 🧹 Chores

- [dependency] Update version 1.6.4 [`(14271d5)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/14271d502f23152ea551c889a020453d412897c9)



### 🔧 Build System

- 🔧 [build] Update version to 1.6.4 in package.json and package-lock.json
 - [dependency] Update package version from 1.6.3 to 1.6.4 for release

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(356d121)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/356d12105d4f7aa2ac8d349a78347386297c8941)


- 🔧 [build] Update version to 1.6.3 in package.json and package-lock.json
 - [dependency] Update version 1.6.3 in both package.json and package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dfcd5be)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/dfcd5be44a87503d8ab37379a0ac35d7f705fef9)


- 🔧 [build] Enhance version update logic in workflows
 - 🛠️ Update manual-publish.yml to check for current version before updating
 - 🛠️ Add error handling for version conflicts in manual-publish.yml
 - 🛠️ Modify release.yml to align package version with release tag only when necessary
 - 🛠️ Improve logging for version updates in release.yml

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d2da805)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d2da80526f7d4184f46786821deee7b266f4ac75)


- 🔧 [build] Update version to 1.6.2 in package.json and package-lock.json
 - [dependency] Update package version from 1.6.1 to 1.6.2 for release

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(76a7301)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/76a730163e99d8475af945301f7ed5b2dfba98c4)


- 🔧 [build] Update release workflow to continue on error for version update step
 - Added `continue-on-error: true` to the version update step to prevent workflow failure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c4736fd)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/c4736fd369e6f1263c8623cdf38b0dd583fd6c59)


- 🔧 [build] Add workflow_dispatch trigger to release workflow
 - Enables manual triggering of the release workflow

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(535f620)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/535f6209fdd4a528432c6176f0acc39a10d1b96e)


- 🔧 [build] Downgrade version to 1.6.1 in package.json and package-lock.json
 - Updated version from 1.6.2 to 1.6.1 in both package.json and package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(496e59b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/496e59bed36208d6a373934a7b63fbbd3b157fdb)






## [1.6.2] - 2026-02-23


[[d810b5d](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d810b5d8bdb1475de5982322657f398005a4910d)...
[e789a7b](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/e789a7b378b809fd40398dfb93ddd662a61cdfd1)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/d810b5d8bdb1475de5982322657f398005a4910d...e789a7b378b809fd40398dfb93ddd662a61cdfd1))


### 📦 Dependencies

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/eslint-plugin-chunkyLint

* 'main' of https://github.com/Nick2bad4u/eslint-plugin-chunkyLint:
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update github/codeql-action
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update actions/upload-artifact
  Update dependabot.yml
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update dependency group
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update dependency group
  test(deps): [dependency] Update dependency group
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update dependency group
  test(deps): [dependency] Update dependency group
  test(deps): [dependency] Update js-yaml 4.1.1
  [skip-ci] Allow linting step to continue on error
  test(deps): [dependency] Update dependency group
  test(deps): [dependency] Update dependency group
  [ci][skip-ci](deps): [dependency] Update dependency groupSigned-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(854ec74)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/854ec74488c4fc64b5f83c6fb2da081d68456e42)


- Merge pull request #41 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-1228dcec7f

test(deps): [dependency] Update dependency group [`(43ac92b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/43ac92bf8fe0eb485e3cb7116b5ae427c6f11314)


- *(deps)* [dependency] Update dependency group [`(acbe8bb)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/acbe8bb9624a3caac2f4988cd21165080dadc7fa)


- *(deps)* [dependency] Update github/codeql-action [`(1ba3179)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/1ba317934a673e75acd554d8d485a4767c7b846a)


- Merge pull request #38 from Nick2bad4u/dependabot/github_actions/github-actions-3b94abdcc2

[ci][skip-ci](deps): [dependency] Update actions/upload-artifact 6.0.0 in the github-actions group [`(d9821eb)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d9821eb3b1a15bfea9c9aeb05e7d24c46fe290b0)


- *(deps)* [dependency] Update actions/upload-artifact [`(f8395d2)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/f8395d273ada8f846898c9bf39392024d417072b)


- Merge pull request #39 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-ab633d47b1

test(deps): [dependency] Update dependency group [`(d0786a0)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d0786a027246efd50cc61bcbc2a7c20c79cd05ba)


- *(deps)* [dependency] Update dependency group [`(2db5ae5)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/2db5ae521e5845d673bf14e98473cc3c47227de7)


- Update dependabot.yml [`(35ac5c6)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/35ac5c6faea1f30741c824acedccf55090a5e90a)


- Merge pull request #36 from Nick2bad4u/dependabot/github_actions/github-actions-9512951ba1

[ci][skip-ci](deps): [dependency] Update dependency group [`(205aa5f)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/205aa5f277a63cd99d99ab4ab388d7f606acbccf)


- *(deps)* [dependency] Update dependency group [`(ac4d7d7)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/ac4d7d7df2c71dbec81e06dc791861e642f9832b)


- Merge pull request #37 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-d717f61e16

test(deps): [dependency] Update dependency group [`(f5b5bdd)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/f5b5bdd856cbc0e0ee541d4c9a0088812947d29f)


- *(deps)* [dependency] Update dependency group [`(767505b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/767505b9c193b225c415502bc07d8eaf7dcc3604)


- Merge pull request #34 from Nick2bad4u/dependabot/github_actions/github-actions-4ee9ca5a3b

[ci][skip-ci](deps): [dependency] Update dependency group [`(82a5e0e)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/82a5e0e6e907f107c695a25c59e2fc9271e849be)


- *(deps)* [dependency] Update dependency group [`(65d8322)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/65d8322fbdc061e286bce4b8ad1a6d83239adddb)


- Merge pull request #35 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-6641fbc941

test(deps): [dependency] Update dependency group [`(7829dc8)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/7829dc886df1277442f9b0149772cd58fb52e56e)


- *(deps)* [dependency] Update dependency group [`(abb8b41)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/abb8b4133696f18cb05fd51ebc3c06e4046583ca)


- Merge pull request #33 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-3ec6bd4fec

test(deps): [dependency] Update dependency group [`(db409e0)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/db409e040541473e5c0427d76ed4c37a6b9e26b3)


- *(deps)* [dependency] Update dependency group [`(1fc982a)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/1fc982a2be0b558cf8c8c4b1e2e6164aab4cd46f)


- Merge pull request #31 from Nick2bad4u/dependabot/github_actions/github-actions-1f6d7429db

[ci][skip-ci](deps): [dependency] Update dependency group [`(91a3074)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/91a30748222c7e3e04f550bf1694a8e8778c7649)


- *(deps)* [dependency] Update dependency group [`(1c04fb1)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/1c04fb1224ea41e25e601933323871df5693774a)


- Merge pull request #32 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-e109aa6077

test(deps): [dependency] Update dependency group [`(ab16d3b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/ab16d3b045544647251bafb2a927a8f831369f0f)


- *(deps)* [dependency] Update dependency group [`(f2be2bf)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/f2be2bf5a4ba62985bbcb0f13b3f9d040dbef5b5)


- Merge pull request #30 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-0c15e9f33d

test(deps): [dependency] Update dependency group [`(1e9a949)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/1e9a949a9a55d80f80e46c8ee0a95c4c0cc1519e)


- *(deps)* [dependency] Update dependency group [`(0c6cff2)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/0c6cff25f39ac8cff236772985a91c64c62bc94f)


- Merge pull request #29 from Nick2bad4u/dependabot/npm_and_yarn/js-yaml-4.1.1

test(deps): [dependency] Update js-yaml 4.1.1 [`(0392cc4)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/0392cc41f9aff616692300cb45a406801069e476)


- *(deps)* [dependency] Update js-yaml 4.1.1 [`(50b4537)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/50b4537b92bbd13bc3c7dec82eca665ca6fc6a1c)


- Merge pull request #28 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-fc2a9abc1f

test(deps): [dependency] Update dependency group [`(d43f27c)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d43f27c28285f4e49aadc40611af70097e698fc6)


- *(deps)* [dependency] Update dependency group [`(a35a1eb)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/a35a1ebaa47e110b246840cd8f9b8cfa990582fb)


- Merge pull request #24 from Nick2bad4u/dependabot/github_actions/github-actions-949d9de0ae

[ci][skip-ci](deps): [dependency] Update dependency group [`(84fc7f8)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/84fc7f88ac26162c68a71ad5409d2700f08e8fdf)


- *(deps)* [dependency] Update dependency group [`(fd21077)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/fd21077b901948796becdf92dbd004ede0862013)


- Merge pull request #25 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-9a5324784a

test(deps): [dependency] Update dependency group [`(6c9bc7c)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/6c9bc7c0059147a23ae13acb8c5c1d23e8b639b5)


- *(deps)* [dependency] Update dependency group [`(8578246)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/85782460dae3e57a8b59faf078e38fb4ac9675d0)



### 🛠️ Other Changes

- Merge PR #40

[ci][skip-ci](deps): [dependency] Update github/codeql-action 4.31.9 in the github-actions group [`(8edb505)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/8edb505156f4b903923644416476b49cf6a3a238)


- [skip-ci] Allow linting step to continue on error [`(f94d61b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/f94d61b2f23e3f192ba27bd30e37f635392a7a76)



### 🚜 Refactor

- *(tests)* Standardize import quotes and improve formatting [`(d810b5d)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d810b5d8bdb1475de5982322657f398005a4910d)



### 🔧 Build System

- 🔧 [build] Update version to 1.6.2 in package.json and package-lock.json
 - [dependency] Update package version from 1.6.1 to 1.6.2 in both package.json and package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e789a7b)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/e789a7b378b809fd40398dfb93ddd662a61cdfd1)


- 🔧 [build] Downgrade version to 1.6.1 in package.json and package-lock.json
 - Updated version from 1.6.2 to 1.6.1 to reflect the correct release

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e0e3b17)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/e0e3b17a6dd7daa1a35a30d15d5a5162a4b4dff5)


- 🔧 [build] [dependency] Update version 1.6.2
 - Updated package version in package.json from 1.6.1 to 1.6.2
 - Added @eslint/js as a new dev dependency

🛠️ [fix] Refactor ESLint mocks in tests
 - Changed ESLint mock implementations in multiple test files to use function expressions for better clarity
 - Updated mock implementations in chunker.test.ts, cli.test.ts, fileScanner.test.ts, and others to improve readability and maintainability

🧪 [test] Enhance test coverage and stability
 - Added eslint-disable comments for specific rules in various test files to prevent linting issues
 - Improved mock implementations for ESLint in fileScanner-coverage.test.ts and fileScanner-integration.test.ts to ensure accurate testing of ESLint interactions
 - Mocked fs module in configLoader.test.ts to expose real write/mkdir helpers for temp file tests

🎨 [style] Update vitest configuration
 - Modified vitest.config.ts to include specific test file patterns and exclude unnecessary directories from coverage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c9322f9)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/c9322f9588af12666f13a594bbaa86c87b78777c)


- 🔧 [build] Update dependencies in package.json

 - 🔧 Update "commander" from "^14.0.1" to "^14.0.3" for improved command-line interface features.
 - 🔧 Upgrade "eslint" from "^9.36.0" to "^10.0.1" to incorporate the latest linting rules and fixes.
 - 🔧 Update "p-limit" from "^7.1.1" to "^7.3.0" for enhanced performance in limiting promise concurrency.
 - 🔧 Upgrade "@types/node" from "^24.5.2" to "^25.3.0" for better TypeScript support with the latest Node.js types.
 - 🔧 Update "@vitest/coverage-v8" from "^3.2.4" to "^4.0.18" to leverage new coverage features and improvements.
 - 🔧 Upgrade "tsx" from "^4.20.5" to "^4.21.0" for the latest TypeScript execution enhancements.
 - 🔧 Update "typescript" from "^5.9.2" to "^5.9.3" to include the latest TypeScript features and bug fixes.
 - 🔧 Upgrade "typescript-eslint" from "^8.44.1" to "^8.56.0" for improved TypeScript linting capabilities.
 - 🔧 Update "vitest" from "^3.2.4" to "^4.0.18" to utilize the latest testing features and improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb8c6d5)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/eb8c6d54f71f6107171630ae81def73e0077f5ac)


- 🔧 [build] Update TypeScript configuration for improved build process

 - ✨ Add "pretty": true for better readability of error messages
 - 🔒 Enable "alwaysStrict": true to enforce strict mode in all files
 - ⚡ Enable "incremental": true for faster builds by reusing previous build information
 - 🧹 Introduce "erasableSyntaxOnly": true to limit syntax checks to erasable code
 - 🔄 Set "moduleDetection": "auto" to automatically detect module format
 - 📁 Specify "tsBuildInfoFile": "tsconfig.tsbuildinfo" for storing incremental build information

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9e5071a)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/9e5071a12e512daa82465ed5caf6b382f4a3a464)






## [1.6.1] - 2025-09-24


[[5fc83b8](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/5fc83b8ff29a4ded3ed039fec52f72a7b2a1cf8f)...
[bdd00fb](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/bdd00fba2b9c9817b849c7c366e64cb2e8bde5cd)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/5fc83b8ff29a4ded3ed039fec52f72a7b2a1cf8f...bdd00fba2b9c9817b849c7c366e64cb2e8bde5cd))


### 📦 Dependencies

- Merge pull request #1 from Nick2bad4u/dependabot/npm_and_yarn/npm_and_yarn-f5c1666f0c

[dependency] Update vite 7.1.5 in the npm_and_yarn group across 1 directory [`(eb173c4)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/eb173c4d1bf36b8dcefe22a89ffe1945033601d6)


- [dependency] Update vite in the npm_and_yarn group across 1 directory

[dependency] Updates the npm_and_yarn group with 1 update in the / directory: [vite](https://github.com/vitejs/vite/tree/HEAD/packages/vite).


Updates `vite` from 7.1.4 to 7.1.5
- [Release notes](https://github.com/vitejs/vite/releases)
- [Changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)
- [Commits](https://github.com/vitejs/vite/commits/v7.1.5/packages/vite)

---
updated-dependencies:
- dependency-name: vite
  dependency-version: 7.1.5
  dependency-type: indirect
  dependency-group: npm_and_yarn
...

Signed-off-by: dependabot[bot] <support@github.com> [`(45c28d3)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/45c28d375446ff099e8273e6bde64efae127b82c)



### 🛡️ Security

- Merge pull request #2 from step-security-bot/chore/GHA-150257-stepsecurity-remediation

[StepSecurity] Apply security best practices [`(dc0cb08)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/dc0cb0812f1afb5d6af6fa33fe78ed0b35f28a36)


- [StepSecurity] Apply security best practices

Signed-off-by: StepSecurity Bot <bot@stepsecurity.io> [`(e112ebb)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/e112ebb8950c09b840ff0d492929dd5e5f0d4fc1)



### 🛠️ Other Changes

- Update Dependabot schedule to quarterly [`(bcc9071)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/bcc9071299611b37bbd7091f89cd9a04e2b0f0e1)



### 🚜 Refactor

- 🚜 [refactor] Preserve original error cause in thrown errors

This commit refactors error handling to improve debuggability by preserving the original error context.

*   ✨ Updates error handling in the configuration loader and file scanner.
    *   When catching and re-throwing errors, the original error is now attached to the `cause` property of the new `Error` object.
    *   This provides richer stack traces and makes it easier to diagnose the root cause of failures during configuration loading and file discovery.
*   🎨 Simplifies the array creation for ignore patterns in the file scanner by removing unnecessary newlines.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(980d4e4)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/980d4e4af283b0392ee4f352042a803da697a521)



### 🧪 Testing

- 🧪 [test] Add comprehensive integration and coverage tests

- Adds extensive unit, integration, and coverage tests for CLI, config loader, file scanner, logger, and main chunker functionality.
- Improves test reliability by using real file operations and advanced mocking strategies.
- Ensures thorough coverage of edge cases, error handling, and previously uncovered logic branches.
- Updates documentation and README for consistency and clarity.
- Refactors code formatting for better readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5fc83b8)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/5fc83b8ff29a4ded3ed039fec52f72a7b2a1cf8f)



### 🧹 Chores

- [dependency] Update version 1.6.1 [`(bdd00fb)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/bdd00fba2b9c9817b849c7c366e64cb2e8bde5cd)


- 🧹 [chore] [dependency] Updates version to 1.5.0, updates dependencies, and improves error handling

This release focuses on dependency maintenance, CI process enhancements, and developer experience improvements.

✨ [feat]
-   Improves error handling by adding the original error as a `cause` to new errors thrown in `configLoader` and `fileScanner`, preserving stack traces for easier debugging.

👷 [ci]
-   Upgrades the Codecov action from `v3` to `v5` in the CI workflow.
-   Adds the required `CODECOV_TOKEN` to the workflow for authentication.

🧪 [test]
-   Adds `lcov` to the list of Vitest coverage reporters, enabling proper report generation for Codecov.

🧹 [chore]
-   [dependency] Updates the project version from `1.4.0` to `1.5.0`.
-   Updates runtime and development dependencies to their latest versions, including ESLint, TypeScript, and Commander.
-   Adds `.github/chatmodes/` to `.prettierignore` and the ESLint ignore configuration to exclude generated files from formatting and linting.

📝 [docs]
-   Updates the Codecov badge URL in the README to point to the new `app.codecov.io` domain.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d809988)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/d809988382cf48d22b7a58c899e2538c95bd2aec)


- 🧹 [chore] [dependency] Update version 1.4.0

Updates package metadata to reflect new release.
Prepares for publishing changes or new features included in 1.4.0.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10ee437)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/10ee437172824a0673dc1be9e23809c343975964)



### 🔧 Build System

- 🔧 [build] Update tsconfig.test.json to include compiler options for Vitest types

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(da0bc0d)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/da0bc0d5bf55060cded0b2956b2f732797569b91)


- 🔧 [build] Update ESLint configuration to include test TypeScript project
 - Added "tsconfig.test.json" to parser options for ESLint
 - Ensured test files are recognized in the TypeScript compilation process

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(700d895)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/700d89577bb8e26e7fe3db378059f7a04578c2c9)


- 🔧 [build] Exclude test files from TypeScript compilation

Updates the TypeScript configuration to prevent test files from being included in the final build output.

- Adds glob patterns for `*.test.ts` and `*.spec.ts` to the `exclude` array in `tsconfig.json`.
- This ensures a cleaner production build by omitting development-only test code. 🧹

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7fa4063)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/7fa4063191286b8da39804bcee8729ddcd56b146)






## [1.3.0] - 2025-09-02


[[c0ddd9f](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/c0ddd9f5d6ba550cf85c9f347626088ac13537ea)...
[8a07196](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/8a0719652068f935fa24445e6bea1d58189d9ba8)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/c0ddd9f5d6ba550cf85c9f347626088ac13537ea...8a0719652068f935fa24445e6bea1d58189d9ba8))


### 🧹 Chores

- [dependency] Update version 1.3.0 [`(8a07196)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/8a0719652068f935fa24445e6bea1d58189d9ba8)






## [1.1.0] - 2025-09-02


[[64b9895](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/64b98954781960c7b04a434345b8ab710633f87a)...
[97dcb6c](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/97dcb6ca34e4ef4ab40b4f003503293b9e74cd00)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/compare/64b98954781960c7b04a434345b8ab710633f87a...97dcb6ca34e4ef4ab40b4f003503293b9e74cd00))


### ✨ Features

- ✨ [feat] Add ESLint Chunker with CLI, config, docs, and tests

Introduces a TypeScript-based ESLint chunking runner to improve linting performance and reliability for large codebases.

 - Provides a robust CLI for chunked ESLint execution with incremental cache updates, auto-fixing, error recovery, and real-time progress reporting.
 - Supports flexible configuration via JSON, TypeScript, and JavaScript config files, with auto-discovery and CLI overrides.
 - Implements smart file discovery, chunking logic, custom logger, and programmatic API.
 - Adds comprehensive documentation, unit tests, and example usage for maintainability and developer onboarding.
 - Establishes modern tooling and best practices, including flat ESLint config, Vitest coverage, and Prettier formatting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(33c4121)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/33c4121eeaae6aa0f082b552c837a168541388fb)



### 🛠️ Other Changes

- Initial commit [`(64b9895)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/64b98954781960c7b04a434345b8ab710633f87a)



### 🧹 Chores

- [dependency] Update version 1.1.0 [`(97dcb6c)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/97dcb6ca34e4ef4ab40b4f003503293b9e74cd00)


- 🧹 [chore] Rename package to eslint-plugin-chunkylint and update docs

- Standardizes package name to `eslint-plugin-chunkylint` across all configs, documentation, CI/CD workflows, and install instructions.
- Retains legacy CLI bin names for backward compatibility; adds new canonical bin.
- Updates README and configuration docs for migration steps, badges, and usage.
- Introduces publishing/deprecation guide for handling npm transition and user migration.
- Improves test suite with stricter typings for ESLint mocks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(659a3d2)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/659a3d26d019bbf42c3c0842a64d088b831ac487)



### 👷 CI/CD

- 👷 [ci] Update workflow dry run logic and metadata

- Refines conditional checks in publishing workflow to improve clarity and ensure correct execution of dry run and actual publish steps.
- Adjusts npm publish steps to use explicit value comparison for dry run input.
- Updates package metadata for bin paths and repository URL to align with npm conventions and enhance package distribution reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(94ca8ee)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/94ca8ee5bbb610b8db9802541aa925fd5ea86223)


- 👷 [ci] Add automated CI/CD workflows and binary aliases

Implements GitHub Actions workflows for CI, release, and manual npm publishing, including setup documentation and required secrets.

Adds multiple command aliases for the CLI tool, making it runnable as `chunkylint`, `chunky-lint`, and the original name to improve usability.

Updates README with quick start info, visual branding, configuration details, and common usage patterns for various workflows.

Removes unused files and consolidates Prettier config. Improves `.gitignore` for new cache and build artifacts.

 - Enables robust, multi-version Node.js testing, coverage upload, and safer publishing.
 - Makes the CLI easier to run via npx and in CI environments.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(49c1971)`](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/commit/49c19711bdc86fb51c1fb24bea79348c31821a33)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/eslint-plugin-chunkyLint/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
