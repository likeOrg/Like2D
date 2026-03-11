import like from './like/index.ts';
import { Source, Scene, ImageHandle, getButtonName } from './like/index.ts';

// Example demonstrating Like2D graphics API with Scene-based architecture
let rotation = 0;
let pepperImage: ImageHandle | null = null;
let audioSource: Source | null = null;
let gameStartTime = 0;
let lastSleepTime = 0;
let sleepStatus = '';
let currentSaveStatus: string | undefined = undefined;

// Player state for movement demo
const player = {
  x: 250,
  y: 350,
  speed: 200, // pixels per second
};

// Game state for save/load demo
interface GameState {
  rotation: number;
  playerX: number;
  playerY: number;
  savedAt: string;
}

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
    like.graphics.setBackgroundColor(0.1, 0.1, 0.15, 1);
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
    like.input.map('save_game', ['F5']);
    like.input.map('load_game', ['F9']);
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
      case 'save_game': {
        const state: GameState = {
          rotation: rotation,
          playerX: player.x,
          playerY: player.y,
          savedAt: new Date().toLocaleString()
        };
        const writeSuccess = await like.localstorage.write('demo_save', state);
        if (writeSuccess) {
          currentSaveStatus = `Saved at ${state.savedAt}`;
        } else {
          currentSaveStatus = 'Failed to save!';
        }
        console.log('Save result:', writeSuccess, state);
        break;
      }
      case 'load_game': {
        const loadedState = await like.localstorage.read<GameState>('demo_save');
        if (loadedState) {
          rotation = loadedState.rotation;
          player.x = loadedState.playerX;
          player.y = loadedState.playerY;
          currentSaveStatus = `Loaded from ${loadedState.savedAt}`;
          console.log('Loaded state:', loadedState);
        } else {
          currentSaveStatus = 'No save file found!';
        }
        break;
      }
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
    like.graphics.setColor(1, 1, 1, 1);
    like.graphics.setFont(28, 'sans-serif');
    like.graphics.print('Like2D Framework Demo', 20, 30);
    
    // Draw FPS and timer info
    const fps = like.timer.getFPS();
    const delta = like.timer.getDelta();
    const currentTime = like.timer.getTime();
    const elapsedTime = currentTime - gameStartTime;
    const isSleeping = like.timer.isSleeping();
    
    like.graphics.setColor(0.2, 0.9, 0.2, 1);
    like.graphics.setFont(16);
    like.graphics.print(`FPS: ${fps}`, like.getWidth() - 100, 30);
    like.graphics.print(`Delta: ${(delta * 1000).toFixed(2)}ms`, like.getWidth() - 160, 50);
    like.graphics.print(`Time: ${elapsedTime.toFixed(1)}s`, like.getWidth() - 160, 70);
    
    if (isSleeping) {
      like.graphics.setColor(0.9, 0.2, 0.2, 1);
      like.graphics.print('SLEEPING', like.getWidth() - 160, 90);
    }
    
    if (sleepStatus) {
      like.graphics.setColor(0.9, 0.6, 0.2, 1);
      like.graphics.print(sleepStatus, 20, 580);
    }
    
    // Draw filled red rectangle
    like.graphics.setColor(0.9, 0.2, 0.2, 1);
    like.graphics.rectangle('fill', 50, 100, 100, 80);
    
    // Draw outlined rectangle
    like.graphics.setColor(0.2, 0.9, 0.2, 1);
    like.graphics.rectangle('line', 50, 100, 100, 80);
    
    // Draw filled blue circle
    like.graphics.setColor(0.2, 0.4, 0.9, 1);
    like.graphics.circle('fill', centerX, centerY, 50);
    
    // Draw outlined circle
    like.graphics.setColor(1, 1, 0.2, 1);
    like.graphics.circle('line', centerX, centerY, 60);
    
    // Draw lines
    like.graphics.setColor(0.5, 0.5, 0.5, 1);
    like.graphics.line(200, 100, 350, 180);
    like.graphics.line(200, 180, 350, 100, 400, 140);
    
    // Draw polygon
    like.graphics.setColor(0.8, 0.3, 0.8, 1);
    like.graphics.polygon('fill', 500, 100, 550, 150, 500, 200, 450, 150);
    
    // Draw outlined polygon
    like.graphics.setColor(1, 0.5, 0.2, 1);
    like.graphics.polygon('line', 600, 100, 650, 150, 600, 200, 550, 150);
    
    // Demo coordinate transformations
    like.graphics.push();
    like.graphics.translate(centerX, 300);
    like.graphics.rotate(rotation);
    like.graphics.setColor(0.2, 0.8, 0.9, 1);
    like.graphics.rectangle('fill', -40, -40, 80, 80);
    like.graphics.pop();
    
    // Draw images if loaded (draw() skips silently if not ready)
    // Using path directly - looks up handle in cache
    like.graphics.setColor(1, 1, 1, 1);
    like.graphics.draw('pepper.png', 650, 350);
    
    // Draw scaled down image
    like.graphics.draw('pepper.png', 650, 350, 0, 0.5, 0.5);
    
    // Draw rotated image (using handle if available)
    if (pepperImage && pepperImage.isReady()) {
      like.graphics.push();
      like.graphics.translate(200, 400);
      like.graphics.rotate(rotation * 0.5);
      like.graphics.draw(pepperImage, 0, 0, 0, 0.4, 0.4, pepperImage.width / 2, pepperImage.height / 2);
      like.graphics.pop();
      
      // Draw image quad (sub-region) - just the center portion
      like.graphics.push();
      like.graphics.translate(400, 400);
      like.graphics.rotate(-rotation * 0.3);
      like.graphics.drawq(
        pepperImage,
        { 
          x: pepperImage.width * 0.25, 
          y: pepperImage.height * 0.25, 
          width: pepperImage.width * 0.5, 
          height: pepperImage.height * 0.5 
        },
        0, 0, 0, 1.2, 1.2
      );
      like.graphics.pop();
      
      // Image info
      like.graphics.setColor(0.8, 0.8, 0.8, 1);
      like.graphics.setFont(14);
      like.graphics.print(`Image: ${pepperImage.width}x${pepperImage.height}`, 20, 80);
    }
    
    // Audio status display
    if (audioSource && audioSource.isReady()) {
      like.graphics.setColor(0.9, 0.6, 0.2, 1);
      like.graphics.setFont(18);
      const isPlaying = audioSource.isPlaying();
      const statusText = isPlaying ? 'Playing' : audioSource.isPaused() ? 'Paused' : 'Stopped';
      like.graphics.print(`Audio: ${statusText} (${Math.round(audioSource.tell() * 10) / 10}s / ${Math.round(audioSource.getDuration() * 10) / 10}s)`, 20, 520);
    }
    
    if (currentSaveStatus) {
      like.graphics.setColor(0.9, 0.9, 0.2, 1);
      like.graphics.print(currentSaveStatus, 20, 550);
    }
    
    // Input action system demo
    like.graphics.setColor(0.9, 0.7, 0.2, 1);
    like.graphics.setFont(16);
    like.graphics.print('Input Actions (mapped):', like.getWidth() - 250, 130);
    
    const jumpActive = like.input.isDown('jump');
    const fireActive = like.input.isDown('fire');
    
    like.graphics.setColor(jumpActive ? 0.2 : 0.5, jumpActive ? 0.9 : 0.5, 0.2, 1);
    like.graphics.print(`Jump: ${jumpActive ? 'PRESSED' : 'up'}`, like.getWidth() - 250, 155);
    
    like.graphics.setColor(fireActive ? 0.9 : 0.5, fireActive ? 0.2 : 0.5, 0.2, 1);
    like.graphics.print(`Fire: ${fireActive ? 'PRESSED' : 'up'}`, like.getWidth() - 250, 175);
    
    // Print instructions
    like.graphics.setColor(0.6, 0.6, 0.6, 1);
    like.graphics.setFont(16);
    like.graphics.print('Press any key to see it logged', 20, like.getHeight() - 120);
    like.graphics.print('Click anywhere for mouse position', 20, like.getHeight() - 100);
    like.graphics.print('Audio: Space=Play/Stop, S=Stop, P=Pause/Resume', 20, like.getHeight() - 80);
    like.graphics.print('Save/Load: F5=Save, F9=Load', 20, like.getHeight() - 60);
    like.graphics.print('Timer: L=Sleep 2 seconds', 20, like.getHeight() - 40);
    like.graphics.print('Input: WASD/Arrows to move, Space/W/Up to jump', 20, like.getHeight() - 20);
    
    // ===== KEYBOARD & MOUSE INPUT DEMO =====
    
    // Display mouse position
    const mousePos = like.mouse.getPosition();
    like.graphics.setColor(0.2, 0.9, 0.9, 1);
    like.graphics.setFont(16);
    like.graphics.print(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 20, 180);
    
    // Draw mouse position indicator on canvas
    like.graphics.setColor(0.2, 0.9, 0.9, 0.5);
    like.graphics.circle('line', mousePos.x, mousePos.y, 10);
    like.graphics.line(mousePos.x - 15, mousePos.y, mousePos.x + 15, mousePos.y);
    like.graphics.line(mousePos.x, mousePos.y - 15, mousePos.x, mousePos.y + 15);
    
    // Display mouse button states
    const lmb = like.mouse.isDown(1) ? 'L' : '_';
    const mmb = like.mouse.isDown(2) ? 'M' : '_';
    const rmb = like.mouse.isDown(3) ? 'R' : '_';
    like.graphics.setColor(0.9, 0.9, 0.2, 1);
    like.graphics.print(`Mouse Buttons: [${lmb}] [${mmb}] [${rmb}]`, 20, 200);
    
    // Keyboard input demo - show arrow keys and WASD state
    like.graphics.setFont(18);
    let keyY = 230;
    
    // Arrow keys display
    like.graphics.setColor(0.7, 0.7, 0.7, 1);
    like.graphics.print('Keyboard (hold to see):', 20, keyY);
    keyY += 25;
    
    // Draw arrow key states using input mapping
    const up = like.input.isDown('move_up');
    const down = like.input.isDown('move_down');
    const left = like.input.isDown('move_left');
    const right = like.input.isDown('move_right');
    
    like.graphics.setColor(up ? 0.2 : 0.5, up ? 0.9 : 0.5, 0.2, 1);
    like.graphics.rectangle(up ? 'fill' : 'line', 170, keyY - 5, 25, 25);
    like.graphics.setColor(up ? 0 : 0.5, 1, up ? 0 : 0.5, 1);
    like.graphics.print('↑', 175, keyY);
    
    like.graphics.setColor(left ? 0.2 : 0.5, left ? 0.9 : 0.5, 0.2, 1);
    like.graphics.rectangle(left ? 'fill' : 'line', 135, keyY + 20, 25, 25);
    like.graphics.setColor(left ? 0 : 0.5, 1, left ? 0 : 0.5, 1);
    like.graphics.print('←', 140, keyY + 25);
    
    like.graphics.setColor(down ? 0.2 : 0.5, down ? 0.9 : 0.5, 0.2, 1);
    like.graphics.rectangle(down ? 'fill' : 'line', 170, keyY + 20, 25, 25);
    like.graphics.setColor(down ? 0 : 0.5, 1, down ? 0 : 0.5, 1);
    like.graphics.print('↓', 175, keyY + 25);
    
    like.graphics.setColor(right ? 0.2 : 0.5, right ? 0.9 : 0.5, 0.2, 1);
    like.graphics.rectangle(right ? 'fill' : 'line', 205, keyY + 20, 25, 25);
    like.graphics.setColor(right ? 0 : 0.5, 1, right ? 0 : 0.5, 1);
    like.graphics.print('→', 210, keyY + 25);
    
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
      like.graphics.setColor(0.9, 0.5, 0.2, 1);
      like.graphics.print(`Active: ${activeKeys.join(', ')}`, 20, keyY);
    }
    
    // Show gamepad status
    keyY += 30;
    const connectedGamepads = like.gamepad.getConnectedGamepads();
    if (connectedGamepads.length > 0) {
      like.graphics.setColor(0.2, 0.8, 0.2, 1);
      like.graphics.print(`Gamepads connected: ${connectedGamepads.length}`, 20, keyY);
      
      // Show pressed buttons for each connected gamepad
      for (const gpIndex of connectedGamepads) {
        keyY += 20;
        const pressedButtons = like.gamepad.getPressedButtons(gpIndex);
        if (pressedButtons.size > 0) {
          const buttonNames = Array.from(pressedButtons).map(idx => getButtonName(idx));
          like.graphics.print(`  GP${gpIndex}: ${buttonNames.join(', ')}`, 20, keyY);
        }
      }
    } else {
      like.graphics.setColor(0.5, 0.5, 0.5, 1);
      like.graphics.print('No gamepads connected', 20, keyY);
    }
    
    // Interactive element - move a circle with WASD/Arrows
    keyY += 40;
    like.graphics.setColor(0.5, 0.5, 0.5, 1);
    like.graphics.print('Move player with WASD or Arrow keys:', 20, keyY);
    like.graphics.print(`Player: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, keyY + 20);
    
    // Draw player at actual position
    like.graphics.setColor(0.2, 0.9, 0.4, 1);
    like.graphics.circle('fill', player.x, player.y, 15);
    like.graphics.setColor(0, 1, 0, 1);
    like.graphics.circle('line', player.x, player.y, 15);
  },



  mousepressed: (x: number, y: number, button: number) => {
    console.log('Mouse pressed at', x, y, 'button:', button);
  }
};

// Initialize with scene
like.init();
like.setScene(demoScene);
like.start();
