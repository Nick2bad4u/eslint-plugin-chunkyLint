# GitHub Actions CI/CD Setup

This repository uses GitHub Actions for automated testing and publishing to npm.

## Required Secrets

To use the automated publishing workflows, you need to configure the following secrets in your GitHub repository settings:

### Go to: Repository Settings → Secrets and variables → Actions

1. **`NPM_TOKEN`** (Required for publishing)
   - Create an automation token on [npmjs.com](https://www.npmjs.com/settings/tokens)
   - Choose "Automation" token type for CI/CD usage
   - Add the token as a repository secret

2. **`GH_TOKEN`** (Optional, for manual publish workflow)
   - Create a Personal Access Token with `repo` scope
   - This allows the manual publish workflow to commit version bumps
   - If not provided, `GITHUB_TOKEN` will be used (limited permissions)

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

- **Triggers:** Push to main/master, Pull Requests
- **Actions:** Type checking, linting, testing, building
- **Node versions:** 18.x, 20.x, 22.x
- **Coverage:** Uploads to Codecov (optional)

### 2. Release Workflow (`.github/workflows/release.yml`)

- **Triggers:** When a GitHub release is published
- **Actions:** Full CI + publish to npm
- **Version:** Extracted from release tag (e.g., `v1.0.0` → `1.0.0`)
- **Requires:** `NPM_TOKEN` secret

### 3. Manual Publish Workflow (`.github/workflows/manual-publish.yml`)

- **Triggers:** Manual dispatch from GitHub Actions tab
- **Actions:** Version bump + publish or dry run
- **Options:**
  - Version: `1.0.0` (explicit) or `patch`/`minor`/`major` (semantic)
  - Dry run: Test without actually publishing
- **Requires:** `NPM_TOKEN` secret, optionally `GH_TOKEN`

## Publishing Process

### Option 1: GitHub Releases (Recommended)

1. Create a new release on GitHub
2. Use semantic version tags (e.g., `v1.0.0`)
3. Publish the release
4. Workflow automatically publishes to npm

### Option 2: Manual Workflow

1. Go to Actions → Manual Publish
2. Choose version bump type or explicit version
3. Optionally enable dry run to test
4. Run workflow

### Option 3: Local Publishing

```bash
npm run build
npm test
npm publish
```

## Package Aliases

The package is published with multiple command aliases:

- `eslint-chunker` (main command)
- `chunkylint` (short alias)
- `chunky-lint` (hyphenated alias)

All work with npx:

```bash
npx eslint-chunker
npx chunkylint
npx chunky-lint
```
