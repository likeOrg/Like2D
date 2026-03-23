import { createLike, type ImageHandle, type Source, type Like, type CanvasSize, LikeEvent } from "like";
import { StartScreen } from "like/prefab-scenes";
import { Vec2 } from "like/math/vector2";
import { callSceneHandlers, Scene } from "like/scene";

let pepperImage: ImageHandle | null = null;
let audioSource: Source | null = null;

const player = {
  pos: [240, 160] as [number, number],
  speed: 200,
};

const scales: CanvasSize[] = [
  [320, 320],
  [800, 300],
  [240, 320],
  'native'
];
let scaleIndex = 0;

const container = document.getElementById('game-container')!;
const like = createLike(container);

const demoScene: Scene = {
  load(like: Like) {
    like.canvas.setMode(scales[0]);
    pepperImage = like.gfx.newImage('pepper.png');
    audioSource = like.audio.newSource('./test.ogg');
    
    like.input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'ButtonBottom']);
    like.input.map('fire', ['MouseLeft', 'RT']);
    like.input.map('move_left', ['ArrowLeft', 'KeyA', 'DPLeft']);
    like.input.map('move_right', ['ArrowRight', 'KeyD', 'DPRight']);
    like.input.map('move_up', ['ArrowUp', 'KeyW', 'DPUp']);
    like.input.map('move_down', ['ArrowDown', 'KeyS', 'DPDown']);
    like.input.map('audio_play_pause', ['KeyP']);
    like.input.map('sleep_timer', ['KeyL']);
    like.input.map('toggle_pointer_lock', ['KeyC']);
  },

  update(like: Like, dt: number) {
    let moveDelta: [number, number] = [0, 0];
    if (like.input.isDown('move_left')) moveDelta = Vec2.add(moveDelta, [-1, 0]);
    if (like.input.isDown('move_right')) moveDelta = Vec2.add(moveDelta, [1, 0]);
    if (like.input.isDown('move_up')) moveDelta = Vec2.add(moveDelta, [0, -1]);
    if (like.input.isDown('move_down')) moveDelta = Vec2.add(moveDelta, [0, 1]);
    player.pos = Vec2.add(player.pos, Vec2.mul(moveDelta, player.speed * dt));
    // Wrap around edges
    player.pos = Vec2.mod(player.pos, like.canvas.getSize());
  },

  mousemoved(like: Like, pos: [number, number], delta: [number, number]) {
    if (like.mouse.isPointerLocked()) {
      // Relative movement when pointer is locked - move the player
      const sensitivity = 0.5;
      player.pos = Vec2.add(player.pos, Vec2.mul(delta, sensitivity));
    }
  },

  keypressed(like: Like, scancode: string) {
    if (scancode === 'KeyZ') {
      scaleIndex = (scaleIndex + 1) % scales.length;
      console.log();
      const mode = scales[scaleIndex];
      like.canvas.setMode(mode);
    }
  },

  actionpressed(like: Like, action: string) {
    console.log('Action pressed:', action);
    if (action === 'jump') console.log('Jump!');
    if (action === 'fire') console.log('Fire!');
    if (action === 'audio_play_pause' && audioSource?.isReady()) {
      audioSource.isPlaying() ? audioSource.stop() : audioSource.play();
    }
    if (action === 'sleep_timer') {
      like.timer.sleep(2);
    }
    if (action === 'toggle_pointer_lock') {
      const locked = like.mouse.isPointerLocked();
      like.mouse.lockPointer(!locked);
    }
  },

  draw(like: Like) {
    const { timer, mouse, gamepad, gfx } = like;
    gfx.clear([0.1, 0.1, 0.15, 1]);
    const canvasSize = like.canvas.getMode().size;
    const center = Vec2.mul(canvasSize, 0.5);
    const [w, h] = canvasSize;

    gfx.print('white', 'Like Demo', [20, 30], { font: '28px sans-serif' });
    gfx.print('yellow', `Scaling: ${scales[scaleIndex]} (Z to cycle)`, [20, 60], { font: '14px sans-serif' });

    gfx.print('lime', `FPS: ${timer.getFPS()}`, [w - 80, 30]);
    gfx.print('lime', `${(timer.getDelta() * 1000).toFixed(1)}ms`, [w - 80, 48]);
    if (timer.isSleeping()) gfx.print('red', 'SLEEPING', [w - 100, 66]);

    gfx.rectangle('fill', 'red', [50, 100, 100, 80]);
    gfx.rectangle('line', 'lime', [50, 100, 100, 80]);
    gfx.circle('fill', 'blue', center, 50);
    gfx.circle('line', 'yellow', center, 60);
    gfx.line('gray', [[200, 100], [350, 180]]);
    gfx.polygon('fill', 'magenta', [[350, 100], [400, 150], [350, 200], [300, 150]]);

    if (pepperImage?.isReady()) {
      gfx.push()
      gfx.rotate(timer.getTime())
      gfx.draw(pepperImage, [380, 220]);
      gfx.draw(pepperImage, [420, 220], { scale: 0.5 });
      gfx.pop()
    }

    const mousePos = mouse.getPosition();
    gfx.print('cyan', `Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, [20, 180], { font: '16px sans-serif' });
    gfx.circle('line', 'cyan', mousePos, 10);

    const [l, m, r] = [mouse.isDown('left') ? 'L' : '_', mouse.isDown('middle') ? 'M' : '_', mouse.isDown('right') ? 'R' : '_'];
    gfx.print('yellow', `Buttons: [${l}] [${m}] [${r}]`, [20, 200], { font: '16px sans-serif' });
    gfx.print(mouse.isPointerLocked() ? 'lime' : 'gray', `Pointer Lock: ${mouse.isPointerLocked() ? 'ON' : 'OFF'} (C to toggle)`, [20, 220], { font: '14px sans-serif' });

    gfx.print('springgreen', `Player: (${Math.round(player.pos[0])}, ${Math.round(player.pos[1])})`, [20, h - 30], { font: '16px sans-serif' });
    gfx.circle('fill', 'springgreen', player.pos, 15);
    gfx.circle('line', 'lime', player.pos, 15);

    // Display gamepad axes
    const axes = gamepad.getGamepad(0)?.axes;
    if (axes && axes.length > 0) {
      gfx.print('orange', 'Gamepad Axes:', [20, 260], { font: '16px sans-serif' });
      axes.forEach((axis, i) => {
        gfx.print('white', `  Axis ${i}: ${axis.toFixed(3)}`, [20, 280 + i * 18], { font: '14px sans-serif' });
      });
    } else {
      gfx.print('gray', 'No gamepad connected', [20, 260], { font: '14px sans-serif' });
    }
  },
};

document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
  like.canvas.setFullscreen(true);
});

like.setScene(new StartScreen(demoScene));
await like.start();
