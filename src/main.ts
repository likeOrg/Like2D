import { like, ImageHandle } from "./like/index.ts";
import type { Source, Scene } from './like/index.ts';
import { getButtonName } from './like/index.ts';

// Example demonstrating Like2D graphics API with Scene-based architecture
let rotation = 0;
let pepperImage: ImageHandle | null = null;
let audioSource: Source | null = null;
let gameStartTime = 0;
let lastSleepTime = 0;
let sleepStatus = '';

// Player state for movement demo
const player = {
  x: 250,
  y: 350,
  speed: 200, // pixels per second
};

const demoScene: Scene = {
  width: 800,
  height: 600,

  load: () => {
    // Start loading assets - they return immediately
    pepperImage = like.graphics.newImage('pepper.png');
    audioSource = like.audio.newSource('./test.ogg');
    
    console.log('Game loaded! Assets loading in background...');
    gameStartTime = like.timer.getTime();
    
    // Set initial background color (dark gray)
    like.graphics.setBackgroundColor([0.1, 0.1, 0.15, 1]);
    like.graphics.setFont(24);
    
    // Setup input mappings for game actions
    like.input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'GP ButtonBottom']);
    like.input.map('fire', ['MouseLeft', 'KeyZ', 'GP RT']);
    like.input.map('move_left', ['ArrowLeft', 'KeyA', 'GP DPadLeft']);
    like.input.map('move_right', ['ArrowRight', 'KeyD', 'GP DPadRight']);
    like.input.map('move_up', ['ArrowUp', 'KeyW', 'GP DPadUp']);
    like.input.map('move_down', ['ArrowDown', 'KeyS', 'GP DPadDown']);
    
    // Menu/system actions
    like.input.map('audio_play_pause', ['Space']);
    like.input.map('audio_stop', ['KeyS']);
    like.input.map('audio_pause_resume', ['KeyP']);
    like.input.map('sleep_timer', ['KeyL']);
  },

  update: (dt: number) => {
    // Update rotation
    rotation += dt;
    
    // Smooth player movement using isDown (continuous)
    if (like.input.isDown('move_left')) {
      player.x -= player.speed * dt;
    }
    if (like.input.isDown('move_right')) {
      player.x += player.speed * dt;
    }
    if (like.input.isDown('move_up')) {
      player.y -= player.speed * dt;
    }
    if (like.input.isDown('move_down')) {
      player.y += player.speed * dt;
    }
    
    // Keep player in bounds
    player.x = Math.max(15, Math.min(like.getWidth() - 15, player.x));
    player.y = Math.max(15, Math.min(like.getHeight() - 15, player.y));
  },

  actionpressed: async (action: string) => {
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
  },

  actionreleased: (action: string) => {
    console.log('Action released:', action);
  },

  gamepadpressed: (gamepadIndex: number, buttonIndex: number, buttonName: string) => {
    console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) pressed`);
  },

  gamepadreleased: (gamepadIndex: number, buttonIndex: number, buttonName: string) => {
    console.log(`Gamepad ${gamepadIndex}: ${buttonName} (button ${buttonIndex}) released`);
  },

  draw: () => {
    const centerX = like.getWidth() / 2;
    const centerY = like.getHeight() / 2;
    
    // Draw title
    like.graphics.print('Like2D Framework Demo', 20, 30, { 
      color: [1, 1, 1, 1],
      font: '28px sans-serif'
    });
    
    // Draw FPS and timer info
    const fps = like.timer.getFPS();
    const delta = like.timer.getDelta();
    const currentTime = like.timer.getTime();
    const elapsedTime = currentTime - gameStartTime;
    const isSleeping = like.timer.isSleeping();
    
    like.graphics.print(`FPS: ${fps}`, like.getWidth() - 100, 30, { color: [0.2, 0.9, 0.2, 1] });
    like.graphics.print(`Delta: ${(delta * 1000).toFixed(2)}ms`, like.getWidth() - 160, 50, { color: [0.2, 0.9, 0.2, 1] });
    like.graphics.print(`Time: ${elapsedTime.toFixed(1)}s`, like.getWidth() - 160, 70, { color: [0.2, 0.9, 0.2, 1] });
    
    if (isSleeping) {
      like.graphics.print('SLEEPING', like.getWidth() - 160, 90, { color: [0.9, 0.2, 0.2, 1] });
    }
    
    if (sleepStatus) {
      like.graphics.print(sleepStatus, 20, 580, { color: [0.9, 0.6, 0.2, 1] });
    }
    
    // Draw filled red rectangle
    like.graphics.rectangle('fill', 50, 100, 100, 80, { color: [0.9, 0.2, 0.2, 1] });
    
    // Draw outlined rectangle
    like.graphics.rectangle('line', 50, 100, 100, 80, { color: [0.2, 0.9, 0.2, 1] });
    
    // Draw filled blue circle
    like.graphics.circle('fill', centerX, centerY, 50, { color: [0.2, 0.4, 0.9, 1] });
    
    // Draw outlined circle
    like.graphics.circle('line', centerX, centerY, 60, { color: [1, 1, 0.2, 1] });
    
    // Draw lines
    like.graphics.line([200, 100, 350, 180], { color: [0.5, 0.5, 0.5, 1] });
    like.graphics.line([200, 180, 350, 100, 400, 140], { color: [0.5, 0.5, 0.5, 1] });
    
    // Draw polygon
    like.graphics.polygon('fill', [500, 100, 550, 150, 500, 200, 450, 150], { 
      color: [0.8, 0.3, 0.8, 1] 
    });
    
    // Draw outlined polygon
    like.graphics.polygon('line', [600, 100, 650, 150, 600, 200, 550, 150], { 
      color: [1, 0.5, 0.2, 1] 
    });
    
    // Demo coordinate transformations
    like.graphics.push();
    like.graphics.translate(centerX, 300);
    like.graphics.rotate(rotation);
    like.graphics.rectangle('fill', -40, -40, 80, 80, { color: [0.2, 0.8, 0.9, 1] });
    like.graphics.pop();
    
    // Draw images if loaded (draw() skips silently if not ready)
    // Using path directly - looks up handle in cache
    like.graphics.draw('pepper.png', 650, 350);
    
    // Draw scaled down image
    like.graphics.draw('pepper.png', 650, 350, { sx: 0.5, sy: 0.5 });
    
    // Draw rotated image (using handle if available)
    if (pepperImage && pepperImage.isReady()) {
      like.graphics.push();
      like.graphics.translate(200, 400);
      like.graphics.rotate(rotation * 0.5);
      like.graphics.draw(pepperImage, 0, 0, { 
        sx: 0.4, 
        sy: 0.4, 
        ox: pepperImage.width / 2, 
        oy: pepperImage.height / 2 
      });
      like.graphics.pop();
      
      // Draw image quad (sub-region) - just the center portion
      like.graphics.push();
      like.graphics.translate(400, 400);
      like.graphics.rotate(-rotation * 0.3);
      like.graphics.draw(
        pepperImage,
        0, 0,
        {
          quad: [
            pepperImage.width * 0.25, 
            pepperImage.height * 0.25, 
            pepperImage.width * 0.5, 
            pepperImage.height * 0.5 
          ],
          sx: 1.2,
          sy: 1.2
        }
      );
      like.graphics.pop();
      
      // Image info
      like.graphics.print(`Image: ${pepperImage.width}x${pepperImage.height}`, 20, 80, { 
        color: [0.8, 0.8, 0.8, 1],
        font: '14px sans-serif'
      });
    }
    
    // Audio status display
    if (audioSource && audioSource.isReady()) {
      const isPlaying = audioSource.isPlaying();
      const statusText = isPlaying ? 'Playing' : audioSource.isPaused() ? 'Paused' : 'Stopped';
      like.graphics.print(
        `Audio: ${statusText} (${Math.round(audioSource.tell() * 10) / 10}s / ${Math.round(audioSource.getDuration() * 10) / 10}s)`, 
        20, 520, 
        { color: [0.9, 0.6, 0.2, 1], font: '18px sans-serif' }
      );
    }
    
    // Input action system demo
    like.graphics.print('Input Actions (mapped):', like.getWidth() - 250, 130, { 
      color: [0.9, 0.7, 0.2, 1],
      font: '16px sans-serif'
    });
    
    const jumpActive = like.input.isDown('jump');
    const fireActive = like.input.isDown('fire');
    
    like.graphics.print(
      `Jump: ${jumpActive ? 'PRESSED' : 'up'}`, 
      like.getWidth() - 250, 155, 
      { color: jumpActive ? [0.2, 0.9, 0.2, 1] : [0.5, 0.5, 0.5, 1] }
    );
    
    like.graphics.print(
      `Fire: ${fireActive ? 'PRESSED' : 'up'}`, 
      like.getWidth() - 250, 175, 
      { color: fireActive ? [0.9, 0.2, 0.2, 1] : [0.5, 0.5, 0.5, 1] }
    );
    
    // Print instructions
    like.graphics.print('Press any key to see it logged', 20, like.getHeight() - 120, { 
      color: [0.6, 0.6, 0.6, 1],
      font: '16px sans-serif'
    });
    like.graphics.print('Click anywhere for mouse position', 20, like.getHeight() - 100, { 
      color: [0.6, 0.6, 0.6, 1],
      font: '16px sans-serif'
    });
    like.graphics.print('Audio: Space=Play/Stop, S=Stop, P=Pause/Resume', 20, like.getHeight() - 80, { 
      color: [0.6, 0.6, 0.6, 1],
      font: '16px sans-serif'
    });
    like.graphics.print('Timer: L=Sleep 2 seconds', 20, like.getHeight() - 60, { 
      color: [0.6, 0.6, 0.6, 1],
      font: '16px sans-serif'
    });
    like.graphics.print('Input: WASD/Arrows to move, Space/W/Up to jump', 20, like.getHeight() - 20, { 
      color: [0.6, 0.6, 0.6, 1],
      font: '16px sans-serif'
    });
    
    // ===== KEYBOARD & MOUSE INPUT DEMO =====
    
    // Display mouse position
    const mousePos = like.mouse.getPosition();
    like.graphics.print(`Mouse: (${Math.round(mousePos[0])}, ${Math.round(mousePos[1])})`, 20, 180, { 
      color: [0.2, 0.9, 0.9, 1],
      font: '16px sans-serif'
    });
    
    // Draw mouse position indicator on canvas
    like.graphics.circle('line', mousePos[0], mousePos[1], 10, { color: [0.2, 0.9, 0.9, 0.5] });
    like.graphics.line([mousePos[0] - 15, mousePos[1], mousePos[0] + 15, mousePos[1]], {
      color: [0.2, 0.9, 0.9, 0.5]
    });
    like.graphics.line([mousePos[0], mousePos[1] - 15, mousePos[0], mousePos[1] + 15], {
      color: [0.2, 0.9, 0.9, 0.5]
    });
    
    // Display mouse button states
    const lmb = like.mouse.isDown(1) ? 'L' : '_';
    const mmb = like.mouse.isDown(2) ? 'M' : '_';
    const rmb = like.mouse.isDown(3) ? 'R' : '_';
    like.graphics.print(`Mouse Buttons: [${lmb}] [${mmb}] [${rmb}]`, 20, 200, { 
      color: [0.9, 0.9, 0.2, 1],
      font: '16px sans-serif'
    });
    
    // Keyboard input demo - show arrow keys and WASD state
    let keyY = 230;
    
    // Arrow keys display
    like.graphics.print('Keyboard (hold to see):', 20, keyY, { 
      color: [0.7, 0.7, 0.7, 1],
      font: '18px sans-serif'
    });
    keyY += 25;
    
    // Draw arrow key states using input mapping
    const up = like.input.isDown('move_up');
    const down = like.input.isDown('move_down');
    const left = like.input.isDown('move_left');
    const right = like.input.isDown('move_right');
    
    like.graphics.rectangle(up ? 'fill' : 'line', 170, keyY - 5, 25, 25, { 
      color: up ? [0.2, 0.9, 0.2, 1] : [0.5, 0.5, 0.5, 1]
    });
    like.graphics.print('↑', 175, keyY, { color: up ? [0, 1, 0, 1] : [0.5, 1, 0.5, 1] });
    
    like.graphics.rectangle(left ? 'fill' : 'line', 135, keyY + 20, 25, 25, { 
      color: left ? [0.2, 0.9, 0.2, 1] : [0.5, 0.5, 0.5, 1]
    });
    like.graphics.print('←', 140, keyY + 25, { color: left ? [0, 1, 0, 1] : [0.5, 1, 0.5, 1] });
    
    like.graphics.rectangle(down ? 'fill' : 'line', 170, keyY + 20, 25, 25, { 
      color: down ? [0.2, 0.9, 0.2, 1] : [0.5, 0.5, 0.5, 1]
    });
    like.graphics.print('↓', 175, keyY + 25, { color: down ? [0, 1, 0, 1] : [0.5, 1, 0.5, 1] });
    
    like.graphics.rectangle(right ? 'fill' : 'line', 205, keyY + 20, 25, 25, { 
      color: right ? [0.2, 0.9, 0.2, 1] : [0.5, 0.5, 0.5, 1]
    });
    like.graphics.print('→', 210, keyY + 25, { color: right ? [0, 1, 0, 1] : [0.5, 1, 0.5, 1] });
    
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
      like.graphics.print(`Active: ${activeKeys.join(', ')}`, 20, keyY, { 
        color: [0.9, 0.5, 0.2, 1],
        font: '16px sans-serif'
      });
    }
    
    // Show gamepad status
    keyY += 30;
    const connectedGamepads = like.gamepad.getConnectedGamepads();
    if (connectedGamepads.length > 0) {
      like.graphics.print(`Gamepads connected: ${connectedGamepads.length}`, 20, keyY, { 
        color: [0.2, 0.8, 0.2, 1],
        font: '16px sans-serif'
      });
      
      // Show pressed buttons for each connected gamepad
      for (const gpIndex of connectedGamepads) {
        keyY += 20;
        const pressedButtons = like.gamepad.getPressedButtons(gpIndex);
        if (pressedButtons.size > 0) {
          const buttonNames = Array.from(pressedButtons).map(idx => getButtonName(idx));
          like.graphics.print(`  GP${gpIndex}: ${buttonNames.join(', ')}`, 20, keyY, { 
            color: [0.8, 0.8, 0.8, 1],
            font: '16px sans-serif'
          });
        }
      }
      
      // Analog stick visualization
      for (const gpIndex of connectedGamepads) {
        const leftStick = like.gamepad.getLeftStick(gpIndex);
        const rightStick = like.gamepad.getRightStick(gpIndex);
        
        keyY += 25;
        like.graphics.print(`GP${gpIndex} Sticks:`, 20, keyY, { 
          color: [0.7, 0.7, 0.9, 1],
          font: '16px sans-serif'
        });
        
        // Left stick visual
        const leftStickCenterX = 150;
        const leftStickCenterY = keyY + 40;
        const stickRadius = 25;
        
        like.graphics.circle('line', leftStickCenterX, leftStickCenterY, stickRadius, { 
          color: [0.3, 0.3, 0.3, 1]
        });
        like.graphics.circle('fill', leftStickCenterX + leftStick.x * stickRadius, leftStickCenterY + leftStick.y * stickRadius, 5, { 
          color: [0.2, 0.6, 0.9, 1]
        });
        like.graphics.print('L', leftStickCenterX - 4, leftStickCenterY + stickRadius + 5, { 
          color: [0.6, 0.6, 0.6, 1],
          font: '12px sans-serif'
        });
        
        // Right stick visual
        const rightStickCenterX = leftStickCenterX + 70;
        const rightStickCenterY = leftStickCenterY;
        
        like.graphics.circle('line', rightStickCenterX, rightStickCenterY, stickRadius, { 
          color: [0.3, 0.3, 0.3, 1]
        });
        like.graphics.circle('fill', rightStickCenterX + rightStick.x * stickRadius, rightStickCenterY + rightStick.y * stickRadius, 5, { 
          color: [0.9, 0.6, 0.2, 1]
        });
        like.graphics.print('R', rightStickCenterX - 4, rightStickCenterY + stickRadius + 5, { 
          color: [0.6, 0.6, 0.6, 1],
          font: '12px sans-serif'
        });
        
        keyY += stickRadius * 2 + 15;
      }
    } else {
      like.graphics.print('No gamepads connected', 20, keyY, { 
        color: [0.5, 0.5, 0.5, 1],
        font: '16px sans-serif'
      });
    }
    
    // Interactive element - move a circle with WASD/Arrows
    keyY += 40;
    like.graphics.print('Move player with WASD or Arrow keys:', 20, keyY, { 
      color: [0.5, 0.5, 0.5, 1],
      font: '16px sans-serif'
    });
    like.graphics.print(`Player: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, keyY + 20, { 
      color: [0.5, 0.5, 0.5, 1],
      font: '16px sans-serif'
    });
    
    // Draw player at actual position
    like.graphics.circle('fill', player.x, player.y, 15, { color: [0.2, 0.9, 0.4, 1] });
    like.graphics.circle('line', player.x, player.y, 15, { color: [0, 1, 0, 1] });
  },



  mousepressed: (x: number, y: number, button: number) => {
    console.log('Mouse pressed at', x, y, 'button:', button);
  }
};

// Initialize with scene
await like.init();
like.setScene(demoScene);
like.start();
