import { SceneRunner, type Scene, Vec2, getGPName, ImageHandle, type CanvasMode, StartupScene, type GraphicsContext, graphics } from "like2d/scene";
import type { Source } from 'like2d';

// Example demonstrating Like2D graphics API with Scene-based architecture
// This uses the SceneRunner class with Scene objects
// See love-demo.ts for the Love2D-style callback pattern

// Initialize and start with SceneRunner
const container = document.getElementById('scene-container')!;
const runner = new SceneRunner(container);

// Get references to the runner's instances
const { audio, timer, input, keyboard, mouse, gamepad } = runner;

let rotation = 0;
let pepperImage: ImageHandle | null = null;
let audioSource: Source | null = null;
let gameStartTime = 0;
let lastSleepTime = 0;
let sleepStatus = '';

// Player state for movement demo using Vector2
const player = {
  pos: [240, 160] as [number, number],
  speed: 200, // pixels per second
};

// Scaling mode cycling
const scalingModes: CanvasMode[] = [
  { pixelResolution: [320, 320], fullscreen: false },  // Default: Pixel art mode
  { pixelResolution: [800, 300], fullscreen: false },  // Wide pixel
  { pixelResolution: [240, 320], fullscreen: false },  // Portrait pixel
  { pixelResolution: null, fullscreen: false },        // Native
];
let currentScalingIndex = 0;
let scalingModeName = 'Pixel 320x320';

const demoScene: Scene = {
  load: () => {
    runner.setMode(scalingModes[0]);
    // Start loading assets - they return immediately
    pepperImage = graphics.newImage('pepper.png');
    audioSource = audio.newSource('./test.ogg');
    
    console.log('Game loaded! Assets loading in background...');
    gameStartTime = timer.getTime();
    
    // Setup input mappings for game actions
    input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'ButtonBottom']);
    input.map('fire', ['MouseLeft', 'RT']);
    input.map('move_left', ['ArrowLeft', 'KeyA', 'DPLeft']);
    input.map('move_right', ['ArrowRight', 'KeyD', 'DPRight']);
    input.map('move_up', ['ArrowUp', 'KeyW', 'DPUp']);
    input.map('move_down', ['ArrowDown', 'KeyS', 'DPDown']);
    
    // Menu/system actions
    input.map('audio_play_pause', ['Space']);
    input.map('audio_stop', ['KeyS']);
    input.map('audio_pause_resume', ['KeyP']);
    input.map('sleep_timer', ['KeyL']);
  },

  update: (dt: number) => {
    // Update rotation
    rotation += dt;
    
    // Smooth player movement using Vec2 operations
    let moveDelta: [number, number] = [0, 0];
    if (input.isDown('move_left')) moveDelta = Vec2.add(moveDelta, [-1, 0]);
    if (input.isDown('move_right')) moveDelta = Vec2.add(moveDelta, [1, 0]);
    if (input.isDown('move_up')) moveDelta = Vec2.add(moveDelta, [0, -1]);
    if (input.isDown('move_down')) moveDelta = Vec2.add(moveDelta, [0, 1]);
    
    // Apply movement with speed scaling
    player.pos = Vec2.add(player.pos, Vec2.mul(moveDelta, player.speed * dt));
    
    // Keep player in bounds using Vec2.clamp
    const canvasSize = runner.getCanvasSize();
    player.pos = Vec2.clamp(player.pos, [15, 15], Vec2.sub(canvasSize, [15, 15]));
  },

  handleEvent: async (event) => {
    switch (event.type) {
      case 'keypressed': {
        const [scancode] = event.args;
        // Cycle scaling modes with Z key
        if (scancode === 'KeyZ') {
          currentScalingIndex = (currentScalingIndex + 1) % scalingModes.length;
          const newConfig = scalingModes[currentScalingIndex];
          runner.setMode(newConfig);
          
          // Update display name
          switch (currentScalingIndex) {
            case 0:
              scalingModeName = 'Fixed 480x320 (Pixel Art)';
              break;
            case 1:
              scalingModeName = 'Fixed 800x300 (Wide)';
              break;
            case 2:
              scalingModeName = 'Fixed 240x320 (Portrait)';
              break;
            case 3:
              scalingModeName = 'Native (No Scaling)';
              break;
          }
          console.log('Scaling mode:', scalingModeName);
        }
        break;
      }
      case 'actionpressed': {
        const action = event.args[0];
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
            lastSleepTime = timer.getTime();
            timer.sleep(2);
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
      case 'gamepadpressed': {
        const [gamepadIndex, buttonIndex, buttonName] = event.args;
        console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) pressed`);
        break;
      }
      case 'gamepadreleased': {
        const [gamepadIndex, buttonIndex, buttonName] = event.args;
        console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) released`);
        break;
      }
      case 'mousepressed': {
        const [x, y, button] = event.args;
        console.log('Mouse pressed at', x, y, 'button:', button);
        break;
      }
    }
  },

  draw: (g: GraphicsContext) => {
    g.clear([0.1, 0.1, 0.15, 1]);
    const canvasSize = runner.getCanvasSize();
    const center = Vec2.mul(canvasSize, 0.5);
    const [canvasWidth, canvasHeight] = canvasSize;
    
    // Draw title
    g.print('white', 'Scene Pattern Demo', [20, 30], { 
      font: '28px sans-serif'
    });
    
    // Draw current scaling mode
    g.print('yellow', `Scaling: ${scalingModeName} (Press Z to cycle)`, [20, 60], { 
      font: '14px sans-serif'
    });
    
    // Draw FPS and timer info
    const fps = timer.getFPS();
    const delta = timer.getDelta();
    const currentTime = timer.getTime();
    const elapsedTime = currentTime - gameStartTime;
    const isSleeping = timer.isSleeping();
    
    g.print('lime', `FPS: ${fps}`, [canvasWidth - 80, 30]);
    g.print('lime', `${(delta * 1000).toFixed(1)}ms`, [canvasWidth - 80, 48]);
    g.print('lime', `${elapsedTime.toFixed(1)}s`, [canvasWidth - 80, 66]);
    
    if (isSleeping) {
      g.print('red', 'SLEEPING', [canvasWidth - 100, 84]);
    }
    
    if (sleepStatus) {
      g.print('orange', sleepStatus, [20, canvasHeight - 140]);
    }
    
    // Draw filled red rectangle
    g.rectangle('fill', 'red', [50, 100, 100, 80]);
    
    // Draw outlined rectangle
    g.rectangle('line', 'lime', [50, 100, 100, 80]);
    
    // Draw filled blue circle
    g.circle('fill', 'blue', center, 50);
    
    // Draw outlined circle
    g.circle('line', 'yellow', center, 60);
    
    // Draw lines
    g.line('gray', [[200, 100], [350, 180]]);
    g.line('gray', [[200, 180], [350, 100], [400, 140]]);
    
    // Draw polygon
    g.polygon('fill', 'magenta', [[350, 100], [400, 150], [350, 200], [300, 150]]);
    
    // Draw outlined polygon
    g.polygon('line', 'orange', [[430, 100], [460, 150], [430, 200], [400, 150]]);
    
    // Draw images if loaded (draw() skips silently if not ready)
    if (pepperImage && pepperImage.isReady()) {
      const [imgWidth, imgHeight] = pepperImage.size;
      
      g.draw(pepperImage, [380, 220]);
      
      // Draw scaled down image
      g.draw(pepperImage, [420, 220], { scale: 0.5 });
      
      // Image info
      g.print('lightgray', `Image: ${imgWidth}x${imgHeight}`, [20, 80], { 
        font: '14px sans-serif'
      });
    }
    
    // Audio status display
    if (audioSource && audioSource.isReady()) {
      const isPlaying = audioSource.isPlaying();
      const statusText = isPlaying ? 'Playing' : audioSource.isPaused() ? 'Paused' : 'Stopped';
      g.print(
        'darkorange',
        `Audio: ${statusText}`, 
        [20, canvasHeight - 160], 
        { font: '14px sans-serif' }
      );
    }
    
    // Input action system demo
    g.print('gold', 'Actions:', [canvasWidth - 120, 130], { 
      font: '14px sans-serif'
    });
    
    const jumpActive = input.isDown('jump');
    const fireActive = input.isDown('fire');
    
    g.print(
      jumpActive ? 'lime' : 'gray',
      `Jump: ${jumpActive ? 'ON' : 'off'}`, 
      [canvasWidth - 120, 150]
    );
    
    g.print(
      fireActive ? 'red' : 'gray',
      `Fire: ${fireActive ? 'ON' : 'off'}`, 
      [canvasWidth - 120, 168]
    );
    
    // Print instructions
    g.print('silver', 'Press any key to see it logged', [20, canvasHeight - 120], { 
      font: '16px sans-serif'
    });
    g.print('silver', 'Click anywhere for mouse position', [20, canvasHeight - 100], { 
      font: '16px sans-serif'
    });
    g.print('silver', 'Audio: Space=Play/Stop, S=Stop, P=Pause/Resume', [20, canvasHeight - 80], { 
      font: '16px sans-serif'
    });
    g.print('silver', 'Timer: L=Sleep 2 seconds', [20, canvasHeight - 60], { 
      font: '16px sans-serif'
    });
    g.print('silver', 'Input: WASD/Arrows to move, Space/W/Up to jump', [20, canvasHeight - 20], { 
      font: '16px sans-serif'
    });
    
    // ===== KEYBOARD & MOUSE INPUT DEMO =====
    
    // Display mouse position
    const mousePos = mouse.getPosition();
    g.print('cyan', `Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, [20, 180], { 
      font: '16px sans-serif'
    });
    
    // Draw mouse position indicator on canvas
    g.circle('line', 'cyan', mousePos, 10);
    g.line('cyan', [[mousePos[0] - 15, mousePos[1]], [mousePos[0] + 15, mousePos[1]]]);
    g.line('cyan', [[mousePos[0], mousePos[1] - 15], [mousePos[0], mousePos[1] + 15]]);
    
    // Display mouse button states
    const lmb = mouse.isDown(1) ? 'L' : '_';
    const mmb = mouse.isDown(2) ? 'M' : '_';
    const rmb = mouse.isDown(3) ? 'R' : '_';
    g.print('yellow', `Mouse Buttons: [${lmb}] [${mmb}] [${rmb}]`, [20, 200], { 
      font: '16px sans-serif'
    });
    
    // Keyboard input demo - show arrow keys and WASD state
    let keyY = 230;
    
    // Arrow keys display
    g.print('darkgray', 'Keyboard (hold to see):', [20, keyY], { 
      font: '18px sans-serif'
    });
    keyY += 25;
    
    // Draw arrow key states using input mapping
    const up = input.isDown('move_up');
    const down = input.isDown('move_down');
    const left = input.isDown('move_left');
    const right = input.isDown('move_right');
    
    g.rectangle(up ? 'fill' : 'line', up ? 'lime' : 'gray', [170, keyY - 5, 25, 25]);
    g.print(up ? 'lime' : 'lightgreen', '↑', [175, keyY]);
    
    g.rectangle(left ? 'fill' : 'line', left ? 'lime' : 'gray', [135, keyY + 20, 25, 25]);
    g.print(left ? 'lime' : 'lightgreen', '←', [140, keyY + 25]);
    
    g.rectangle(down ? 'fill' : 'line', down ? 'lime' : 'gray', [170, keyY + 20, 25, 25]);
    g.print(down ? 'lime' : 'lightgreen', '↓', [175, keyY + 25]);
    
    g.rectangle(right ? 'fill' : 'line', right ? 'lime' : 'gray', [205, keyY + 20, 25, 25]);
    g.print(right ? 'lime' : 'lightgreen', '→', [210, keyY + 25]);
    
    // Show active keys list
    keyY += 70;
    const activeKeys: string[] = [];
    if (keyboard.isDown('Space')) activeKeys.push('Space');
    if (keyboard.isDown('Enter')) activeKeys.push('Enter');
    if (keyboard.isAnyDown('ShiftLeft', 'ShiftRight')) activeKeys.push('Shift');
    if (keyboard.isAnyDown('ControlLeft', 'ControlRight')) activeKeys.push('Ctrl');
    if (keyboard.isAnyDown('AltLeft', 'AltRight')) activeKeys.push('Alt');
    if (keyboard.isDown('Escape')) activeKeys.push('Esc');
    
    if (activeKeys.length > 0) {
      g.print('orangered', `Active: ${activeKeys.join(', ')}`, [20, keyY], { 
        font: '16px sans-serif'
      });
    }
    
    // Show gamepad status
    keyY += 30;
    const connectedGamepads = gamepad.getConnectedGamepads();
    if (connectedGamepads.length > 0) {
      g.print('limegreen', `Gamepads connected: ${connectedGamepads.length}`, [20, keyY], { 
        font: '16px sans-serif'
      });
      
      // Show pressed buttons for each connected gamepad
      for (const gpIndex of connectedGamepads) {
        keyY += 20;
        const pressedButtons = gamepad.getPressedButtons(gpIndex);
        if (pressedButtons.size > 0) {
          const buttonNames = Array.from(pressedButtons).map(idx => getGPName(idx));
          g.print('lightgray', `  GP${gpIndex}: ${buttonNames.join(', ')}`, [20, keyY], { 
            font: '16px sans-serif'
          });
        }
      }
      
      // Analog stick visualization
      for (const gpIndex of connectedGamepads) {
        const leftStick = gamepad.getLeftStick(gpIndex);
        const rightStick = gamepad.getRightStick(gpIndex);
        
        keyY += 25;
        g.print('lightsteelblue', `GP${gpIndex} Sticks:`, [20, keyY], { 
          font: '16px sans-serif'
        });
        
        // Left stick visual
        const leftStickCenterX = 150;
        const leftStickCenterY = keyY + 40;
        const stickRadius = 25;
        
        g.circle('line', 'dimgray', [leftStickCenterX, leftStickCenterY], stickRadius);
        g.circle('fill', 'dodgerblue', 
          [leftStickCenterX + leftStick.x * stickRadius, leftStickCenterY + leftStick.y * stickRadius], 
          5
        );
        g.print('darkgray', 'L', [leftStickCenterX - 4, leftStickCenterY + stickRadius + 5], { 
          font: '12px sans-serif'
        });
        
        // Right stick visual
        const rightStickCenterX = leftStickCenterX + 70;
        const rightStickCenterY = leftStickCenterY;
        
        g.circle('line', 'dimgray', [rightStickCenterX, rightStickCenterY], stickRadius);
        g.circle('fill', 'darkorange', 
          [rightStickCenterX + rightStick.x * stickRadius, rightStickCenterY + rightStick.y * stickRadius], 
          5
        );
        g.print('darkgray', 'R', [rightStickCenterX - 4, rightStickCenterY + stickRadius + 5], { 
          font: '12px sans-serif'
        });
        
        keyY += stickRadius * 2 + 15;
      }
    } else {
      g.print('gray', 'No gamepads connected', [20, keyY], { 
        font: '16px sans-serif'
      });
    }
    
    // Interactive element - move a circle with WASD/Arrows
    keyY += 40;
    g.print('gray', 'Move player with WASD or Arrow keys:', [20, keyY], { 
      font: '16px sans-serif'
    });
    g.print('gray', `Player: (${Math.round(player.pos[0])}, ${Math.round(player.pos[1])})`, [20, keyY + 20], { 
      font: '16px sans-serif'
    });
    
    // Draw player at actual position
    g.circle('fill', 'springgreen', player.pos, 15);
    g.circle('line', 'lime', player.pos, 15);
  },
};

const fullscreenBtn = document.getElementById('scene-fullscreen');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    runner.setMode({ fullscreen: true });
  });
}

// Start with a startup screen in native mode for crisp text/logo rendering
// This defeats browser autoplay restrictions for audio
runner.setMode({ pixelResolution: null, fullscreen: false });
const startupScene = new StartupScene({ nextScene: demoScene }, runner.setScene.bind(runner));
await runner.start(startupScene);
