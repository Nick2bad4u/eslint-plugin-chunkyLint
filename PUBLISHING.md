# Publishing & Deprecation Guide

## First Publish Under New Name

1. Ensure clean build

```bash
npm ci
npm run build
npm run pack:dry
```

2. Publish

```bash
npm publish --access public
```

## Deprecate Old Package (Optional but Recommended)

Run after confirming the new package appears on npm.

```bash
npm deprecate eslint-chunker@"*" "Renamed to eslint-plugin-chunkylint. Please migrate."
```

Or use script:

```bash
npm run deprecate:old
```

## Manual Publish Workflow

Use GitHub Actions > Manual Publish to bump `patch`/`minor`/`major` or specify exact version, with optional dry run. The workflow runs type-check, lint, tests, then build before publishing.

## Post-Publish Validation Checklist

- [ ] Package visible at https://www.npmjs.com/package/eslint-plugin-chunkylint
- [ ] Binaries resolve: `npx eslint-plugin-chunkylint --version`
- [ ] Legacy aliases still function: `npx eslint-chunker`, `npx chunkylint`, `npx chunky-lint`
- [ ] README badges show correct version/download counts
- [ ] Old package deprecated (if chosen)

## Updating Badges

Badges already point to new name. If forking, update:

- npm version: `https://img.shields.io/npm/v/<name>.svg`
- npm downloads: `https://img.shields.io/npm/dm/<name>.svg`
- CI badge: `https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg`

## Common Issues

| Issue                       | Cause                 | Fix                                                                                  |
| --------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| 404 on npm badge            | Cache delay           | Wait a few minutes after first publish                                               |
| Old name auto-installs      | User lockfile         | Instruct user to `npm uninstall eslint-chunker && npm i -D eslint-plugin-chunkylint` |
| Deprecation warning missing | Forgot deprecate step | Run script `npm run deprecate:old`                                                   |

## Future Steps

- Add changelog with `keepachangelog` format
- Automate versioning (semantic-release / changesets) if desired
