import { createLike } from "like2d/callback";
import type { Source, Like2DEvent, ImageHandle } from 'like2d';
import { Vec2, getGPName } from 'like2d';

// Example demonstrating Like2D with Love2D-style callback API
// This uses the traditional load/update/draw callback pattern directly
// without the Scene object wrapper

let rotation = 0;
let pepperImage: ImageHandle | null = null;
let audioSource: Source | null = null;
let gameStartTime = 0;
let lastSleepTime = 0;
let sleepStatus = '';

// Player state for movement demo using Vector2
const player = {
  pos: [250, 350] as [number, number],
  speed: 200, // pixels per second
};

// Initialize and start
const container = document.getElementById('love-container')!;
const like = createLike(container);

like.load = () => {
  like.setMode({ pixelResolution: [800, 600] });
  // Start loading assets - they return immediately
  pepperImage = like.gfx.newImage('pepper.png');
  audioSource = like.audio.newSource('./test.ogg');
  
  console.log('Game loaded! Assets loading in background...');
  gameStartTime = like.timer.getTime();
  
  // Setup input mappings for game actions
  like.input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'ButtonBottom']);
  like.input.map('fire', ['MouseLeft', 'KeyZ', 'RT']);
  like.input.map('move_left', ['ArrowLeft', 'KeyA', 'DPLeft']);
  like.input.map('move_right', ['ArrowRight', 'KeyD', 'DPRight']);
  like.input.map('move_up', ['ArrowUp', 'KeyW', 'DPUp']);
  like.input.map('move_down', ['ArrowDown', 'KeyS', 'DPDown']);
  
  // Menu/system actions
  like.input.map('audio_play_pause', ['Space']);
  like.input.map('audio_stop', ['KeyS']);
  like.input.map('audio_pause_resume', ['KeyP']);
  like.input.map('sleep_timer', ['KeyL']);
};

like.update = (dt: number) => {
  // Update rotation
  rotation += dt;
  
  // Smooth player movement using Vec2 operations
  let moveDelta: [number, number] = [0, 0];
  if (like.input.isDown('move_left')) moveDelta = Vec2.add(moveDelta, [-1, 0]);
  if (like.input.isDown('move_right')) moveDelta = Vec2.add(moveDelta, [1, 0]);
  if (like.input.isDown('move_up')) moveDelta = Vec2.add(moveDelta, [0, -1]);
  if (like.input.isDown('move_down')) moveDelta = Vec2.add(moveDelta, [0, 1]);
  
  // Apply movement with speed scaling
  player.pos = Vec2.add(player.pos, Vec2.mul(moveDelta, player.speed * dt));
  
  // Keep player in bounds using Vec2.clamp
  const canvasSize = like.getCanvasSize();
  player.pos = Vec2.clamp(player.pos, [15, 15], Vec2.sub(canvasSize, [15, 15]));
};

like.draw = () => {
  like.gfx.clear([0.1, 0.1, 0.15, 1]);
  const canvasSize = like.getCanvasSize();
  const center = Vec2.mul(canvasSize, 0.5);
  const [canvasWidth, canvasHeight] = canvasSize;
  
  // Draw title
  like.gfx.print('white', 'Love2D-style API Demo', [20, 30], { 
    font: '28px sans-serif'
  });
  
  // Draw FPS and timer info
  const fps = like.timer.getFPS();
  const delta = like.timer.getDelta();
  const currentTime = like.timer.getTime();
  const elapsedTime = currentTime - gameStartTime;
  const isSleeping = like.timer.isSleeping();
  
  like.gfx.print('lime', `FPS: ${fps}`, [canvasWidth - 100, 30]);
  like.gfx.print('lime', `Delta: ${(delta * 1000).toFixed(2)}ms`, [canvasWidth - 160, 50]);
  like.gfx.print('lime', `Time: ${elapsedTime.toFixed(1)}s`, [canvasWidth - 160, 70]);
  
  if (isSleeping) {
    like.gfx.print('red', 'SLEEPING', [canvasWidth - 160, 90]);
  }
  
  if (sleepStatus) {
    like.gfx.print('orange', sleepStatus, [20, 580]);
  }
  
  // Draw filled red rectangle
  like.gfx.rectangle('fill', 'red', [50, 100, 100, 80]);
  
  // Draw outlined rectangle
  like.gfx.rectangle('line', 'lime', [50, 100, 100, 80]);
  
  // Draw filled blue circle
  like.gfx.circle('fill', 'blue', center, 50);
  
  // Draw outlined circle
  like.gfx.circle('line', 'yellow', center, 60);
  
  // Draw lines
  like.gfx.line('gray', [[200, 100], [350, 180]]);
  like.gfx.line('gray', [[200, 180], [350, 100], [400, 140]]);
  
  // Draw polygon
  like.gfx.polygon('fill', 'magenta', [[500, 100], [550, 150], [500, 200], [450, 150]]);
  
  // Draw outlined polygon
  like.gfx.polygon('line', 'orange', [[600, 100], [650, 150], [600, 200], [550, 150]]);
  
  // Draw images if loaded (draw() skips silently if not ready)
  if (pepperImage && pepperImage.isReady()) {
    const [imgWidth, imgHeight] = pepperImage.size;
    
    like.gfx.draw(pepperImage, [650, 350]);
    
    // Draw scaled down image
    like.gfx.draw(pepperImage, [650, 350], { scale: 0.5 });
    
    // Image info
    like.gfx.print('lightgray', `Image: ${imgWidth}x${imgHeight}`, [20, 80], { 
      font: '14px sans-serif'
    });
  }
  
  // Audio status display
  if (audioSource && audioSource.isReady()) {
    const isPlaying = audioSource.isPlaying();
    const statusText = isPlaying ? 'Playing' : audioSource.isPaused() ? 'Paused' : 'Stopped';
    like.gfx.print(
      'darkorange',
      `Audio: ${statusText} (${Math.round(audioSource.tell() * 10) / 10}s / ${Math.round(audioSource.getDuration() * 10) / 10}s)`, 
      [20, 520], 
      { font: '18px sans-serif' }
    );
  }
  
  // Input action system demo
  like.gfx.print('gold', 'Input Actions (mapped):', [canvasWidth - 250, 130], { 
    font: '16px sans-serif'
  });
  
  const jumpActive = like.input.isDown('jump');
  const fireActive = like.input.isDown('fire');
  
  like.gfx.print(
    jumpActive ? 'lime' : 'gray',
    `Jump: ${jumpActive ? 'PRESSED' : 'up'}`, 
    [canvasWidth - 250, 155]
  );
  
  like.gfx.print(
    fireActive ? 'red' : 'gray',
    `Fire: ${fireActive ? 'PRESSED' : 'up'}`, 
    [canvasWidth - 250, 175]
  );
  
  // Print instructions
  like.gfx.print('silver', 'Press any key to see it logged', [20, canvasHeight - 120], { 
    font: '16px sans-serif'
  });
  like.gfx.print('silver', 'Click anywhere for mouse position', [20, canvasHeight - 100], { 
    font: '16px sans-serif'
  });
  like.gfx.print('silver', 'Audio: Space=Play/Stop, S=Stop, P=Pause/Resume', [20, canvasHeight - 80], { 
    font: '16px sans-serif'
  });
  like.gfx.print('silver', 'Timer: L=Sleep 2 seconds', [20, canvasHeight - 60], { 
    font: '16px sans-serif'
  });
  like.gfx.print('silver', 'Input: WASD/Arrows to move, Space/W/Up to jump', [20, canvasHeight - 20], { 
    font: '16px sans-serif'
  });
  
  // ===== KEYBOARD & MOUSE INPUT DEMO =====
  
  // Display mouse position
  const mousePos = like.mouse.getPosition();
  like.gfx.print('cyan', `Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, [20, 180], { 
    font: '16px sans-serif'
  });
  
  // Draw mouse position indicator on canvas
  like.gfx.circle('line', 'cyan', mousePos, 10);
  like.gfx.line('cyan', [[mousePos[0] - 15, mousePos[1]], [mousePos[0] + 15, mousePos[1]]]);
  like.gfx.line('cyan', [[mousePos[0], mousePos[1] - 15], [mousePos[0], mousePos[1] + 15]]);
  
  // Display mouse button states
  const lmb = like.mouse.isDown(1) ? 'L' : '_';
  const mmb = like.mouse.isDown(2) ? 'M' : '_';
  const rmb = like.mouse.isDown(3) ? 'R' : '_';
  like.gfx.print('yellow', `Mouse Buttons: [${lmb}] [${mmb}] [${rmb}]`, [20, 200], { 
    font: '16px sans-serif'
  });
  
  // Keyboard input demo - show arrow keys and WASD state
  let keyY = 230;
  
  // Arrow keys display
  like.gfx.print('darkgray', 'Keyboard (hold to see):', [20, keyY], { 
    font: '18px sans-serif'
  });
  keyY += 25;
  
  // Draw arrow key states using input mapping
  const up = like.input.isDown('move_up');
  const down = like.input.isDown('move_down');
  const left = like.input.isDown('move_left');
  const right = like.input.isDown('move_right');
  
  like.gfx.rectangle(up ? 'fill' : 'line', up ? 'lime' : 'gray', [170, keyY - 5, 25, 25]);
  like.gfx.print(up ? 'lime' : 'lightgreen', '↑', [175, keyY]);
  
  like.gfx.rectangle(left ? 'fill' : 'line', left ? 'lime' : 'gray', [135, keyY + 20, 25, 25]);
  like.gfx.print(left ? 'lime' : 'lightgreen', '←', [140, keyY + 25]);
  
  like.gfx.rectangle(down ? 'fill' : 'line', down ? 'lime' : 'gray', [170, keyY + 20, 25, 25]);
  like.gfx.print(down ? 'lime' : 'lightgreen', '↓', [175, keyY + 25]);
  
  like.gfx.rectangle(right ? 'fill' : 'line', right ? 'lime' : 'gray', [205, keyY + 20, 25, 25]);
  like.gfx.print(right ? 'lime' : 'lightgreen', '→', [210, keyY + 25]);
  
  // Show active keys list
  keyY += 70;
  const activeKeys: string[] = [];
  if (like.keyboard.isDown('Space')) activeKeys.push('Space');
  if (like.keyboard.isDown('Enter')) activeKeys.push('Enter');
  if (like.keyboard.isAnyDown('ShiftLeft', 'ShiftRight')) activeKeys.push('Shift');
  if (like.keyboard.isAnyDown('ControlLeft', 'ControlRight')) activeKeys.push('Ctrl');
  if (like.keyboard.isAnyDown('AltLeft', 'AltRight')) activeKeys.push('Alt');
  if (like.keyboard.isDown('Escape')) activeKeys.push('Esc');
  
  if (activeKeys.length > 0) {
    like.gfx.print('orangered', `Active: ${activeKeys.join(', ')}`, [20, keyY], { 
      font: '16px sans-serif'
    });
  }
  
  // Show gamepad status
  keyY += 30;
  const connectedGamepads = like.gamepad.getConnectedGamepads();
  if (connectedGamepads.length > 0) {
    like.gfx.print('limegreen', `Gamepads connected: ${connectedGamepads.length}`, [20, keyY], { 
      font: '16px sans-serif'
    });
    
    // Show pressed buttons for each connected gamepad
    for (const gpIndex of connectedGamepads) {
      keyY += 20;
      const pressedButtons = like.gamepad.getPressedButtons(gpIndex);
      if (pressedButtons.size > 0) {
        const buttonNames = Array.from(pressedButtons).map(idx => getGPName(idx));
        like.gfx.print('lightgray', `  GP${gpIndex}: ${buttonNames.join(', ')}`, [20, keyY], { 
          font: '16px sans-serif'
        });
      }
    }
    
    // Analog stick visualization
    for (const gpIndex of connectedGamepads) {
      const leftStick = like.gamepad.getLeftStick(gpIndex);
      const rightStick = like.gamepad.getRightStick(gpIndex);
      
      keyY += 25;
      like.gfx.print('lightsteelblue', `GP${gpIndex} Sticks:`, [20, keyY], { 
        font: '16px sans-serif'
      });
      
      // Left stick visual
      const leftStickCenterX = 150;
      const leftStickCenterY = keyY + 40;
      const stickRadius = 25;
      
      like.gfx.circle('line', 'dimgray', [leftStickCenterX, leftStickCenterY], stickRadius);
      like.gfx.circle('fill', 'dodgerblue', 
        [leftStickCenterX + leftStick.x * stickRadius, leftStickCenterY + leftStick.y * stickRadius], 
        5
      );
      like.gfx.print('darkgray', 'L', [leftStickCenterX - 4, leftStickCenterY + stickRadius + 5], { 
        font: '12px sans-serif'
      });
      
      // Right stick visual
      const rightStickCenterX = leftStickCenterX + 70;
      const rightStickCenterY = leftStickCenterY;
      
      like.gfx.circle('line', 'dimgray', [rightStickCenterX, rightStickCenterY], stickRadius);
      like.gfx.circle('fill', 'darkorange', 
        [rightStickCenterX + rightStick.x * stickRadius, rightStickCenterY + rightStick.y * stickRadius], 
        5
      );
      like.gfx.print('darkgray', 'R', [rightStickCenterX - 4, rightStickCenterY + stickRadius + 5], { 
        font: '12px sans-serif'
      });
      
      keyY += stickRadius * 2 + 15;
    }
  } else {
    like.gfx.print('gray', 'No gamepads connected', [20, keyY], { 
      font: '16px sans-serif'
    });
  }
  
  // Interactive element - move a circle with WASD/Arrows
  keyY += 40;
  like.gfx.print('gray', 'Move player with WASD or Arrow keys:', [20, keyY], { 
    font: '16px sans-serif'
  });
  like.gfx.print('gray', `Player: (${Math.round(player.pos[0])}, ${Math.round(player.pos[1])})`, [20, keyY + 20], { 
    font: '16px sans-serif'
  });
  
  // Draw player at actual position
  like.gfx.circle('fill', 'springgreen', player.pos, 15);
  like.gfx.circle('line', 'lime', player.pos, 15);
};

like.keypressed = (scancode: string, keycode: string) => {
  console.log(`Key pressed: ${keycode} (scancode: ${scancode})`);
};

like.keyreleased = (scancode: string, keycode: string) => {
  console.log(`Key released: ${keycode} (scancode: ${scancode})`);
};

like.mousepressed = (x: number, y: number, button: number) => {
  console.log(`Mouse pressed at ${x}, ${y}, button: ${button}`);
};

like.mousereleased = (x: number, y: number, button: number) => {
  console.log(`Mouse released at ${x}, ${y}, button: ${button}`);
};

like.gamepadpressed = (gamepadIndex, buttonIndex, buttonName) => {
  console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) pressed`);
};

like.gamepadreleased = (gamepadIndex, buttonIndex, buttonName) => {
  console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) released`);
};

like.handleEvent = async (event: Like2DEvent) => {
  switch (event.type) {
    case 'actionpressed': {
      const action = event.args[0] as unknown as string;
      console.log('Action pressed:', action);

      switch (action) {
        case 'jump':
          console.log('Jump action triggered!');
          break;
        case 'fire':
          console.log('Fire action triggered!');
          break;
        case 'audio_play_pause':
          if (audioSource && audioSource.isReady()) {
            if (audioSource.isPlaying()) {
              audioSource.stop();
            } else {
              audioSource.play();
            }
          }
          break;
        case 'audio_stop':
          if (audioSource && audioSource.isReady()) {
            audioSource.stop();
          }
          break;
        case 'audio_pause_resume':
          if (audioSource && audioSource.isReady()) {
            if (audioSource.isPlaying()) {
              audioSource.pause();
            } else if (audioSource.isPaused()) {
              audioSource.resume();
            }
          }
          break;
        case 'sleep_timer':
          lastSleepTime = like.timer.getTime();
          like.timer.sleep(2);
          sleepStatus = 'Timer sleep activated (2 seconds)';
          console.log('Timer sleeping for 2 seconds starting at:', lastSleepTime);
          break;
      }
      break;
    }
    case 'actionreleased': {
      console.log('Action released:', event.args[0]);
      break;
    }
  }
};

await like.start();

const fullscreenBtn = document.getElementById('love-fullscreen');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    like.setMode({ fullscreen: true });
  });
}
