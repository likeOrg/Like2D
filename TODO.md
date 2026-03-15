# Restructuring TODO

## Phase: Convert to Monorepo for NPM/JSR Publishing

### 1. Workspace Setup
- [x] Create `pnpm-workspace.yaml` with packages/*, demo, and website
- [x] Update root `package.json` with workspace scripts and shared devDependencies

### 2. Core Library Package (`packages/like2d/`)
- [x] Create directory structure
- [x] Move `src/like/` contents to `packages/like2d/src/`
- [x] Create `packages/like2d/package.json` with:
  - [x] Proper `name`, `version`, `description`
  - [x] `type: "module"`
  - [x] `main`, `module`, `types` fields
  - [x] `exports` map for subpath imports
  - [x] `files` array for publishing
  - [x] Keywords, author, license
- [x] Create `packages/like2d/tsconfig.json`
- [x] Create `packages/like2d/README.md` (package-specific)
- [x] Move spec files to `packages/like2d/docs/`

### 3. Demo Application (`demo/`)
- [x] Create directory structure
- [x] Move `src/main.ts` to `demo/src/main.ts`
- [x] Move demo assets (`pepper.png`, `test.ogg`) to `demo/public/`
- [x] Move `src/index.html` to `demo/index.html`
- [x] Create `demo/package.json` with dependency on `like2d: workspace:*`
- [x] Create `demo/vite.config.ts`
- [x] Create `demo/tsconfig.json`

### 4. Website (`website/`)
- [x] Create directory structure
- [x] Create `website/package.json` with:
  - [x] React, Vite dependencies
  - [x] Dependency on `like2d: workspace:*`
  - [x] TypeDoc for API doc generation
- [x] Create `website/vite.config.ts`
- [x] Create `website/tsconfig.json`
- [x] Create `website/src/main.tsx` (empty for now)
- [x] Create `website/src/App.tsx` (empty for now)
- [x] Create placeholder components directory
- [x] Create `website/index.html`
- [x] Set up TSDoc generation script and typedoc.json

### 5. Build System Updates
- [x] Update root `vite.config.ts` or remove if per-app configs suffice
- [x] Ensure TypeScript path mappings work across workspaces
- [x] Update `.gitignore` for new build outputs

### 6. Verification
- [x] Run `pnpm install` to verify workspace setup
- [x] Build `packages/like2d`
- [x] Build and run `demo`
- [x] Build `website`
- [x] Verify all imports resolve correctly
- [x] Test TSDoc generation

### 7. Publishing Preparation (Future)
- [ ] Add JSR configuration (`jsr.json`)
- [ ] Set up GitHub Actions for publishing
- [ ] Configure GitHub Pages deployment for website
- [ ] Add LICENSE file to packages/like2d

## Notes
- Website pages should remain empty/skeleton for now
- Focus on structural changes, not content
- Ensure backward compatibility where possible

## Cleanup Tasks
- [x] Remove legacy `/like/gamecontrollerdb.txt` fetch from `gamepad-mapping.ts` - the `/like/` path is dead code from old directory structure
- [x] Simplify button mapping to unidirectional (`toStandard` only) - reverse mapping can be computed on demand for debugging
- [x] Remove `rawButtonIndex` from `GamepadButtonEvent` - if needed, use a debug feature to iterate the mapping
- [x] Consolidate mapping logic into `gamepad-mapping.ts` - remove `extractVendorProduct` duplication from `gamepad.ts` and simplify `gamepad.ts` to just pass browser strings and receive usable mappings

## All non-future tasks completed! 🎉
