import { createLike, Like, } from "like";
import { ImageHandle } from "like/graphics";
import { AudioSource } from "like/audio";
import { CanvasSize } from "like/graphics";
import { Vec2 } from "like/math";
import { Scene, SceneManager } from "like-scenes";
import { startScreen } from "like-scenes/prefab/startScreen";
import { mapGamepad, buttonSetPS1 } from "like-scenes/prefab/mapGamepad";
import { fadeTransition } from "like-scenes/prefab/fadeTransition";

let pepperImage: ImageHandle;
let audioSource: AudioSource | null = null;

const player = {
  pos: [240, 160] as [number, number],
  speed: 200,
};

const scales: CanvasSize[] = [
  'native',
  [320, 320],
  [800, 300],
  [240, 320],
];
let scaleIndex = 0;

const demoScene: Scene = (like: Like, scenes: SceneManager) => {
  like.canvas.setMode(scales[0]);
  pepperImage = like.gfx.newImage('pepper.png');
  audioSource = like.audio.newSource('./test.ogg');

  like.input.setAction('jump', ['Space', 'ArrowUp', 'KeyW', 'BBottom']);
  like.input.setAction('fire', ['MouseLeft', 'RT']);
  like.input.setAction('move_left', ['ArrowLeft', 'KeyA', 'Left']);
  like.input.setAction('move_right', ['ArrowRight', 'KeyD', 'Right']);
  like.input.setAction('move_up', ['ArrowUp', 'KeyW', 'Up']);
  like.input.setAction('move_down', ['ArrowDown', 'KeyS', 'Down']);
  like.input.setAction('audio_play_pause', ['KeyP']);
  like.input.setAction('toggle_pointer_lock', ['KeyC']);

  like.gamepad.enableAutoLoadMapping(false);

  return {
    load() {
      console.log("loaded!");
    },
    quit() {
      console.log("quitted!");
    },
    update(dt: number) {
      let moveDelta: [number, number] = [0, 0];
      if (like.input.isDown('move_left')) moveDelta = Vec2.add(moveDelta, [-1, 0]);
      if (like.input.isDown('move_right')) moveDelta = Vec2.add(moveDelta, [1, 0]);
      if (like.input.isDown('move_up')) moveDelta = Vec2.add(moveDelta, [0, -1]);
      if (like.input.isDown('move_down')) moveDelta = Vec2.add(moveDelta, [0, 1]);
      player.pos = Vec2.add(player.pos, Vec2.mul(moveDelta, player.speed * dt));
      // Wrap around edges
      player.pos = Vec2.mod(player.pos, like.canvas.getSize());
    },

    mousemoved(_pos: [number, number], delta: [number, number]) {
      if (like.mouse.isPointerLocked()) {
        // Relative movement when pointer is locked - move the player
        const sensitivity = 0.5;
        player.pos = Vec2.add(player.pos, Vec2.mul(delta, sensitivity));
      }
    },

    keypressed(scancode: string) {
      if (scancode === 'KeyZ') {
        scaleIndex = (scaleIndex + 1) % scales.length;
        const mode = scales[scaleIndex];
        like.canvas.setMode(mode);
      }
    },

    actionpressed(action: string) {
      console.log('Action pressed:', action);
      if (action === 'jump') console.log('Jump!');
      if (action === 'fire') console.log('Fire!');
      if (action === 'audio_play_pause' && audioSource?.isReady()) {
        audioSource.isPlaying() ? audioSource.stop() : audioSource.play();
      }
      if (action === 'toggle_pointer_lock') {
        const locked = like.mouse.isPointerLocked();
        like.mouse.lockPointer(!locked);
      }
    },

    gamepadpressed: (_source: number, ...args: unknown[]) => console.log(args),

    gamepadconnected: (index: number) => {
      scenes.push(mapGamepad({ buttons: buttonSetPS1, stickCount: 2 }, index), true);
    },

    draw() {
      const { timer, mouse, gamepad, gfx } = like;

      gfx.clear([0.1, 0.1, 0.15, 1]);

      gfx.draw(pepperImage, like.mouse.getPosition(), { origin: [15, 15], scale: 1 });
      const canvasSize = like.canvas.getMode().size;

      const center = Vec2.mul(canvasSize, 0.5);
      const [w, h] = canvasSize;

      gfx.print('line', 'white', 'Like Demo', [20, 30], { font: '28px sans-serif' });
      gfx.print('fill', 'yellow', `Scaling: ${scales[scaleIndex]} (Z to cycle)`, [20, 60], { font: '14px sans-serif' });

      gfx.print('line', 'lime', `FPS: ${timer.getFPS()}`, [w - 80, 30]);
      gfx.print('fill', 'lime', `${(timer.getDelta() * 1000).toFixed(1)}ms`, [w - 80, 48]);

      gfx.rectangle('fill', 'red', [50, 100, 100, 80]);
      gfx.rectangle('line', 'lime', [50, 100, 100, 80]);
      gfx.circle('fill', 'blue', center, 50);
      gfx.circle('line', 'yellow', center, 60);
      gfx.line('gray', [[200, 100], [350, 180]]);

      const mousePos = mouse.getPosition();
      gfx.print('line', 'cyan', `Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, [20, 180], { font: '16px sans-serif' });
      gfx.circle('line', 'cyan', mousePos, 10);

      const [l, m, r] = [mouse.isDown('left') ? 'L' : '_', mouse.isDown('middle') ? 'M' : '_', mouse.isDown('right') ? 'R' : '_'];
      gfx.print('fill', 'yellow', `Buttons: [${l}] [${m}] [${r}]`, [20, 200], { font: '16px sans-serif' });
      gfx.print('fill', mouse.isPointerLocked() ? 'lime' : 'gray', `Pointer Lock: ${mouse.isPointerLocked() ? 'ON' : 'OFF'} (C to toggle)`, [20, 220], { font: '14px sans-serif' });

      gfx.print('fill', 'springgreen', `Player: (${Math.round(player.pos[0])}, ${Math.round(player.pos[1])})`, [20, h - 30], { font: '16px sans-serif' });
      gfx.circle('fill', 'springgreen', player.pos, 15);
      gfx.circle('line', 'lime', player.pos, 15);

      // Display gamepad sticks
      const sticks = gamepad.getSticks(0);
      if (sticks.length > 0) {
        gfx.print('fill', 'orange', 'Gamepad Axes:', [20, 260], { font: '16px sans-serif' });
        sticks.forEach((pos, i) => {
          gfx.print('line', 'white', `  Stick ${i}: ${pos}`, [20, 280 + i * 18], { font: '14px sans-serif' });
        });
      } else {
        gfx.print('line', 'gray', 'No gamepad connected', [20, 260], { font: '14px sans-serif' });
      }


      const color1 = "white";
      const color2 = "black";
      const size = 20;
      // calc center of screen
      const pos = Vec2.div(like.canvas.getSize(), 2);
      const speed = 0.5;

      like.gfx.withTransform(() => {
        like.gfx.translate(pos);
        like.gfx.rotate(like.timer.getTime() * Math.PI * 2 * speed);
        like.gfx.scale(size);
        like.gfx.circle("fill", color1, [0, 0], 2);
        // use the arc parameter to fill in a semicircle. Note that it's clockwise from {x:1, y:0}.
        like.gfx.circle("fill", color2, [0, 0], 2, { arc: [Math.PI / 2, Math.PI * 3 / 2] });
        like.gfx.circle("fill", color2, [0, -1], 1);
        like.gfx.circle("fill", color1, [0, 1], 1);
        like.gfx.circle("fill", color2, [0, 1], 1 / 3);
        like.gfx.circle("fill", color1, [0, -1], 1 / 3);
      });

      gfx.polygon('fill', 'magenta', [30, 30], [[350, 100], [400, 150], [350, 200], [300, 150]]);
    },
  }
};

document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
  like.canvas.setFullscreen(true);
});

const container = document.getElementById('game-container')!;
const like = createLike(container);
const sceneMan = new SceneManager(like);

sceneMan.push(fadeTransition(demoScene, true), false);
sceneMan.push(startScreen(), true);

await like.start();
