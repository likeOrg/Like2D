import { like, graphics, audio, timer, input, keyboard, mouse, gamepad, ImageHandle, getButtonName, R, V2 } from "like2d/callback";
import type { Source, Scene, Event } from 'like2d';

// Example demonstrating Like2D graphics API with Scene-based architecture
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

const demoScene: Scene = {
  width: 800,
  height: 600,

  load: () => {
    // Start loading assets - they return immediately
    pepperImage = graphics.newImage('pepper.png');
    audioSource = audio.newSource('./test.ogg');
    
    console.log('Game loaded! Assets loading in background...');
    gameStartTime = timer.getTime();
    
    // Set initial background color (dark gray)
    graphics.setBackgroundColor([0.1, 0.1, 0.15, 1]);
    graphics.setFont(24);
    
    // Setup input mappings for game actions
    input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'GP ButtonBottom']);
    input.map('fire', ['MouseLeft', 'KeyZ', 'GP RT']);
    input.map('move_left', ['ArrowLeft', 'KeyA', 'GP DPadLeft']);
    input.map('move_right', ['ArrowRight', 'KeyD', 'GP DPadRight']);
    input.map('move_up', ['ArrowUp', 'KeyW', 'GP DPadUp']);
    input.map('move_down', ['ArrowDown', 'KeyS', 'GP DPadDown']);
    
    // Menu/system actions
    input.map('audio_play_pause', ['Space']);
    input.map('audio_stop', ['KeyS']);
    input.map('audio_pause_resume', ['KeyP']);
    input.map('sleep_timer', ['KeyL']);
  },

  update: (dt: number) => {
    // Update rotation
    rotation += dt;
    
    // Smooth player movement using V2 operations
    let moveDelta: [number, number] = [0, 0];
    if (input.isDown('move_left')) moveDelta = V2.add(moveDelta, [-1, 0]);
    if (input.isDown('move_right')) moveDelta = V2.add(moveDelta, [1, 0]);
    if (input.isDown('move_up')) moveDelta = V2.add(moveDelta, [0, -1]);
    if (input.isDown('move_down')) moveDelta = V2.add(moveDelta, [0, 1]);
    
    // Apply movement with speed scaling
    player.pos = V2.add(player.pos, V2.mul(moveDelta, player.speed * dt));
    
    // Keep player in bounds using V2.clamp
    const canvasSize = graphics.getCanvasSize();
    player.pos = V2.clamp(player.pos, [15, 15], V2.sub(canvasSize, [15, 15]));
  },

  handleEvent: async (event: Event) => {
    switch (event.type) {
      case 'actionpressed': {
        console.log('Action pressed:', event.action);

        switch (event.action) {
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
        console.log('Action released:', event.action);
        break;
      }
      case 'gamepadpressed': {
        console.log(`Gamepad ${event.gamepadIndex}: ${event.buttonName} (button ${event.buttonIndex}) pressed`);
        break;
      }
      case 'gamepadreleased': {
        console.log(`Gamepad ${event.gamepadIndex}: ${event.buttonName} (button ${event.buttonIndex}) released`);
        break;
      }
      case 'mousepressed': {
        console.log('Mouse pressed at', event.x, event.y, 'button:', event.button);
        break;
      }
    }
  },

  draw: () => {
    const canvasSize = graphics.getCanvasSize();
    const center = V2.mul(canvasSize, 0.5);
    const [canvasWidth, canvasHeight] = canvasSize;
    
    // Draw title
    graphics.print('white', 'Like2D Framework Demo', [20, 30], { 
      font: '28px sans-serif'
    });
    
    // Draw FPS and timer info
    const fps = timer.getFPS();
    const delta = timer.getDelta();
    const currentTime = timer.getTime();
    const elapsedTime = currentTime - gameStartTime;
    const isSleeping = timer.isSleeping();
    
    graphics.print('lime', `FPS: ${fps}`, [canvasWidth - 100, 30]);
    graphics.print('lime', `Delta: ${(delta * 1000).toFixed(2)}ms`, [canvasWidth - 160, 50]);
    graphics.print('lime', `Time: ${elapsedTime.toFixed(1)}s`, [canvasWidth - 160, 70]);
    
    if (isSleeping) {
      graphics.print('red', 'SLEEPING', [canvasWidth - 160, 90]);
    }
    
    if (sleepStatus) {
      graphics.print('orange', sleepStatus, [20, 580]);
    }
    
    // Draw filled red rectangle
    graphics.rectangle('fill', 'red', R.create(50, 100, 100, 80));
    
    // Draw outlined rectangle
    graphics.rectangle('line', 'lime', R.create(50, 100, 100, 80));
    
    // Draw filled blue circle
    graphics.circle('fill', 'blue', center, 50);
    
    // Draw outlined circle
    graphics.circle('line', 'yellow', center, 60);
    
    // Draw lines
    graphics.line('gray', [[200, 100], [350, 180]]);
    graphics.line('gray', [[200, 180], [350, 100], [400, 140]]);
    
    // Draw polygon
    graphics.polygon('fill', 'magenta', [[500, 100], [550, 150], [500, 200], [450, 150]]);
    
    // Draw outlined polygon
    graphics.polygon('line', 'orange', [[600, 100], [650, 150], [600, 200], [550, 150]]);
    
    // Demo coordinate transformations
    graphics.push();
    graphics.translate([center[0], 300]);
    graphics.rotate(rotation);
    graphics.rectangle('fill', 'dodgerblue', R.create(-40, -40, 80, 80));
    graphics.pop();
    
    // Draw images if loaded (draw() skips silently if not ready)
    if (pepperImage) {
      graphics.draw(pepperImage, [650, 350]);
      
      // Draw scaled down image
      graphics.draw(pepperImage, [650, 350], { scale: 0.5 });
    }
    
    // Draw rotated image (using handle if available)
    if (pepperImage && pepperImage.isReady()) {
      const [imgWidth, imgHeight] = pepperImage.size;
      
      graphics.push();
      graphics.translate([200, 400]);
      graphics.rotate(rotation * 0.5);
      graphics.draw(pepperImage, [0, 0], { 
        scale: 0.4, 
        origin: [imgWidth / 2, imgHeight / 2] 
      });
      graphics.pop();
      
      // Draw image quad (sub-region) - just the center portion
      graphics.push();
      graphics.translate([400, 400]);
      graphics.rotate(-rotation * 0.3);
      graphics.draw(
        pepperImage,
        [0, 0],
        {
          quad: [
            imgWidth * 0.25, 
            imgHeight * 0.25, 
            imgWidth * 0.5, 
            imgHeight * 0.5 
          ],
          scale: 1.2
        }
      );
      graphics.pop();
      
      // Image info
      graphics.print('lightgray', `Image: ${imgWidth}x${imgHeight}`, [20, 80], { 
        font: '14px sans-serif'
      });
    }
    
    // Audio status display
    if (audioSource && audioSource.isReady()) {
      const isPlaying = audioSource.isPlaying();
      const statusText = isPlaying ? 'Playing' : audioSource.isPaused() ? 'Paused' : 'Stopped';
      graphics.print(
        'darkorange',
        `Audio: ${statusText} (${Math.round(audioSource.tell() * 10) / 10}s / ${Math.round(audioSource.getDuration() * 10) / 10}s)`, 
        [20, 520], 
        { font: '18px sans-serif' }
      );
    }
    
    // Input action system demo
    graphics.print('gold', 'Input Actions (mapped):', [canvasWidth - 250, 130], { 
      font: '16px sans-serif'
    });
    
    const jumpActive = input.isDown('jump');
    const fireActive = input.isDown('fire');
    
    graphics.print(
      jumpActive ? 'lime' : 'gray',
      `Jump: ${jumpActive ? 'PRESSED' : 'up'}`, 
      [canvasWidth - 250, 155]
    );
    
    graphics.print(
      fireActive ? 'red' : 'gray',
      `Fire: ${fireActive ? 'PRESSED' : 'up'}`, 
      [canvasWidth - 250, 175]
    );
    
    // Print instructions
    graphics.print('silver', 'Press any key to see it logged', [20, canvasHeight - 120], { 
      font: '16px sans-serif'
    });
    graphics.print('silver', 'Click anywhere for mouse position', [20, canvasHeight - 100], { 
      font: '16px sans-serif'
    });
    graphics.print('silver', 'Audio: Space=Play/Stop, S=Stop, P=Pause/Resume', [20, canvasHeight - 80], { 
      font: '16px sans-serif'
    });
    graphics.print('silver', 'Timer: L=Sleep 2 seconds', [20, canvasHeight - 60], { 
      font: '16px sans-serif'
    });
    graphics.print('silver', 'Input: WASD/Arrows to move, Space/W/Up to jump', [20, canvasHeight - 20], { 
      font: '16px sans-serif'
    });
    
    // ===== KEYBOARD & MOUSE INPUT DEMO =====
    
    // Display mouse position
    const mousePos = mouse.getPosition();
    graphics.print('cyan', `Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, [20, 180], { 
      font: '16px sans-serif'
    });
    
    // Draw mouse position indicator on canvas
    graphics.circle('line', 'cyan', mousePos, 10);
    graphics.line('cyan', [[mousePos[0] - 15, mousePos[1]], [mousePos[0] + 15, mousePos[1]]]);
    graphics.line('cyan', [[mousePos[0], mousePos[1] - 15], [mousePos[0], mousePos[1] + 15]]);
    
    // Display mouse button states
    const lmb = mouse.isDown(1) ? 'L' : '_';
    const mmb = mouse.isDown(2) ? 'M' : '_';
    const rmb = mouse.isDown(3) ? 'R' : '_';
    graphics.print('yellow', `Mouse Buttons: [${lmb}] [${mmb}] [${rmb}]`, [20, 200], { 
      font: '16px sans-serif'
    });
    
    // Keyboard input demo - show arrow keys and WASD state
    let keyY = 230;
    
    // Arrow keys display
    graphics.print('darkgray', 'Keyboard (hold to see):', [20, keyY], { 
      font: '18px sans-serif'
    });
    keyY += 25;
    
    // Draw arrow key states using input mapping
    const up = input.isDown('move_up');
    const down = input.isDown('move_down');
    const left = input.isDown('move_left');
    const right = input.isDown('move_right');
    
    graphics.rectangle(up ? 'fill' : 'line', up ? 'lime' : 'gray', R.create(170, keyY - 5, 25, 25));
    graphics.print(up ? 'lime' : 'lightgreen', '↑', [175, keyY]);
    
    graphics.rectangle(left ? 'fill' : 'line', left ? 'lime' : 'gray', R.create(135, keyY + 20, 25, 25));
    graphics.print(left ? 'lime' : 'lightgreen', '←', [140, keyY + 25]);
    
    graphics.rectangle(down ? 'fill' : 'line', down ? 'lime' : 'gray', R.create(170, keyY + 20, 25, 25));
    graphics.print(down ? 'lime' : 'lightgreen', '↓', [175, keyY + 25]);
    
    graphics.rectangle(right ? 'fill' : 'line', right ? 'lime' : 'gray', R.create(205, keyY + 20, 25, 25));
    graphics.print(right ? 'lime' : 'lightgreen', '→', [210, keyY + 25]);
    
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
      graphics.print('orangered', `Active: ${activeKeys.join(', ')}`, [20, keyY], { 
        font: '16px sans-serif'
      });
    }
    
    // Show gamepad status
    keyY += 30;
    const connectedGamepads = gamepad.getConnectedGamepads();
    if (connectedGamepads.length > 0) {
      graphics.print('limegreen', `Gamepads connected: ${connectedGamepads.length}`, [20, keyY], { 
        font: '16px sans-serif'
      });
      
      // Show pressed buttons for each connected gamepad
      for (const gpIndex of connectedGamepads) {
        keyY += 20;
        const pressedButtons = gamepad.getPressedButtons(gpIndex);
        if (pressedButtons.size > 0) {
          const buttonNames = Array.from(pressedButtons).map(idx => getButtonName(idx));
          graphics.print('lightgray', `  GP${gpIndex}: ${buttonNames.join(', ')}`, [20, keyY], { 
            font: '16px sans-serif'
          });
        }
      }
      
      // Analog stick visualization
      for (const gpIndex of connectedGamepads) {
        const leftStick = gamepad.getLeftStick(gpIndex);
        const rightStick = gamepad.getRightStick(gpIndex);
        
        keyY += 25;
        graphics.print('lightsteelblue', `GP${gpIndex} Sticks:`, [20, keyY], { 
          font: '16px sans-serif'
        });
        
        // Left stick visual
        const leftStickCenterX = 150;
        const leftStickCenterY = keyY + 40;
        const stickRadius = 25;
        
        graphics.circle('line', 'dimgray', [leftStickCenterX, leftStickCenterY], stickRadius);
        graphics.circle('fill', 'dodgerblue', 
          [leftStickCenterX + leftStick.x * stickRadius, leftStickCenterY + leftStick.y * stickRadius], 
          5
        );
        graphics.print('darkgray', 'L', [leftStickCenterX - 4, leftStickCenterY + stickRadius + 5], { 
          font: '12px sans-serif'
        });
        
        // Right stick visual
        const rightStickCenterX = leftStickCenterX + 70;
        const rightStickCenterY = leftStickCenterY;
        
        graphics.circle('line', 'dimgray', [rightStickCenterX, rightStickCenterY], stickRadius);
        graphics.circle('fill', 'darkorange', 
          [rightStickCenterX + rightStick.x * stickRadius, rightStickCenterY + rightStick.y * stickRadius], 
          5
        );
        graphics.print('darkgray', 'R', [rightStickCenterX - 4, rightStickCenterY + stickRadius + 5], { 
          font: '12px sans-serif'
        });
        
        keyY += stickRadius * 2 + 15;
      }
    } else {
      graphics.print('gray', 'No gamepads connected', [20, keyY], { 
        font: '16px sans-serif'
      });
    }
    
    // Interactive element - move a circle with WASD/Arrows
    keyY += 40;
    graphics.print('gray', 'Move player with WASD or Arrow keys:', [20, keyY], { 
      font: '16px sans-serif'
    });
    graphics.print('gray', `Player: (${Math.round(player.pos[0])}, ${Math.round(player.pos[1])})`, [20, keyY + 20], { 
      font: '16px sans-serif'
    });
    
    // Draw player at actual position
    graphics.circle('fill', 'springgreen', player.pos, 15);
    graphics.circle('line', 'lime', player.pos, 15);
  },
};

// Set up callbacks from the scene object
like.load = demoScene.load?.bind(demoScene);
like.update = demoScene.update.bind(demoScene);
like.draw = demoScene.draw.bind(demoScene);
like.handleEvent = demoScene.handleEvent?.bind(demoScene);

// Initialize and start
const container = document.getElementById('game-container')!;
await like.init(container);

// Setup fullscreen button
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    like.toggleFullscreen();
  });
}
