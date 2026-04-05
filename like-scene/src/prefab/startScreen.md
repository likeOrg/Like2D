## Why

 1. Because the LIKE logo looks awesome.
 2. Autoplay restriction; modern browers don't let you play audio until the page is clicked.
 3. You have to click on the game in order to send inputs, anyway.
 4. It's polite.

## Usage

```typescript
import { createLike, createStartScreen } from 'like';
import { createGameScene } from './game';

// init LIKE with scenes
const container = document.getElementById("myGame");
const like = createLike(container);
const sceneMan = new SceneManager(like);

// these callbacks will be ignored until the scene is clicked
like.update = function () { ... }
like.draw = function () { ... }

// Set up the start screen
like.start();
sceneMan.push(startScreen())
```

Alternatively, copy-paste this code into your own project and modify it freely.

## Custom Rendering

Pass a custom draw function to replace the default logo:

```typescript
const startup = startScreen((like) => {
  like.gfx.clear([0, 0, 0, 1]);
  like.gfx.print([1, 1, 1], 'Click to Start', [100, 100]);
});
```
