# Like2D Examples

**For beginners:** Copy a starter template and build your game.

**Starters** (copy these to start your project):
- `starter/` - Love2D-style callbacks

**For contributors:**
- `feature-test/` - Internal testing/development

**How to use a starter:**
```bash
npx degit likeorg/Like2D/examples/starter my-game
cd my-game
npm install
npm run dev
```

## Note on API

The feature test is using pnpm workspace to load the in-development API,
whereas the starters are using the published NPM package.

You cannot degit the feature test and expect it to work.
