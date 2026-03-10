import like from './like/index.ts';
import { Source } from './like/index.ts';

// Example demonstrating Like2D graphics API
let rotation = 0;
let pepperImage: Awaited<ReturnType<typeof like.graphics.newImage>> | null = null;
let audioSource: Source | null = null;
let gameStartTime = 0;
let lastSleepTime = 0;
let sleepStatus = '';
let currentSaveStatus: string | undefined = undefined;

// Game state for save/load demo
interface GameState {
  rotation: number;
  savedAt: string;
}

like.setCallbacks({
  load: async () => {
    console.log('Game loaded!');
    gameStartTime = like.timer.getTime();
    console.log('Game started at:', gameStartTime);
    
    // Set initial background color (dark gray)
    like.graphics.setBackgroundColor(0.1, 0.1, 0.15, 1);
    like.graphics.setFont(24);
    
    // Load the pepper image
    try {
      pepperImage = await like.graphics.newImage('pepper.png');
      console.log('Image loaded:', pepperImage.width, 'x', pepperImage.height);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
    
    // Load audio
    try {
      audioSource = await like.audio.newSource('./test.ogg');
      console.log('Audio loaded: test.ogg, ready:', audioSource.isReady());
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  },
  
  update: (dt: number) => {
    // Update rotation
    rotation += dt;
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
    
    // Draw images if loaded
    if (pepperImage) {
      // Draw image at normal size
      like.graphics.setColor(1, 1, 1, 1);
      like.graphics.draw('pepper.png', 650, 350);
      
      // Draw scaled down image
      like.graphics.draw('pepper.png', 650, 350, 0, 0.5, 0.5);
      
      // Draw rotated image
      like.graphics.push();
      like.graphics.translate(200, 400);
      like.graphics.rotate(rotation * 0.5);
      like.graphics.draw('pepper.png', 0, 0, 0, 0.4, 0.4, pepperImage.width / 2, pepperImage.height / 2);
      like.graphics.pop();
      
      // Draw image quad (sub-region) - just the center portion
      like.graphics.push();
      like.graphics.translate(400, 400);
      like.graphics.rotate(-rotation * 0.3);
      like.graphics.drawq(
        'pepper.png',
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
    
    // Print instructions
    like.graphics.setColor(0.6, 0.6, 0.6, 1);
    like.graphics.setFont(16);
    like.graphics.print('Press any key to see it logged', 20, like.getHeight() - 100);
    like.graphics.print('Click anywhere for mouse position', 20, like.getHeight() - 80);
    like.graphics.print('Audio: Space=Play/Stop, P=Pause/Resume', 20, like.getHeight() - 60);
    like.graphics.print('Save/Load: F5=Save, F9=Load', 20, like.getHeight() - 40);
    like.graphics.print('Timer: L=Sleep 2 seconds', 20, like.getHeight() - 20);
    
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
    
    // Draw arrow key states
    const up = like.keyboard.isDown('ArrowUp') || like.keyboard.isDown('w') || like.keyboard.isDown('W');
    const down = like.keyboard.isDown('ArrowDown') || like.keyboard.isDown('s') || like.keyboard.isDown('S');
    const left = like.keyboard.isDown('ArrowLeft') || like.keyboard.isDown('a') || like.keyboard.isDown('A');
    const right = like.keyboard.isDown('ArrowRight') || like.keyboard.isDown('d') || like.keyboard.isDown('D');
    
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
    if (like.keyboard.isDown(' ')) activeKeys.push('Space');
    if (like.keyboard.isDown('Enter')) activeKeys.push('Enter');
    if (like.keyboard.isDown('Shift')) activeKeys.push('Shift');
    if (like.keyboard.isDown('Control')) activeKeys.push('Ctrl');
    if (like.keyboard.isDown('Alt')) activeKeys.push('Alt');
    if (like.keyboard.isDown('Escape')) activeKeys.push('Esc');
    
    if (activeKeys.length > 0) {
      like.graphics.setColor(0.9, 0.5, 0.2, 1);
      like.graphics.print(`Active: ${activeKeys.join(', ')}`, 20, keyY);
    }
    
    // Interactive element - move a circle with WASD/Arrows
    keyY += 40;
    like.graphics.setColor(0.5, 0.5, 0.5, 1);
    like.graphics.print('Move this with WASD or Arrow keys:', 20, keyY);
    
    // Calculate player position based on keyboard input
    const playerX = 250 + (right ? 30 : left ? -30 : 0);
    const playerY = keyY + 50 + (down ? 30 : up ? -30 : 0);
    
    like.graphics.setColor(0.2, 0.9, 0.4, 1);
    like.graphics.circle('fill', playerX, playerY, 15);
    like.graphics.setColor(0, 1, 0, 1);
    like.graphics.circle('line', playerX, playerY, 15);
  },
  
  keypressed: async (key: string) => {
    console.log('Key pressed:', key);

    // Audio controls
    if (audioSource && audioSource.isReady()) {
      switch (key.toLowerCase()) {
        case ' ':
          if (audioSource.isPlaying()) {
            audioSource.stop();
          } else {
            audioSource.play();
          }
          break;
        case 's':
          audioSource.stop();
          break;
        case 'p':
          if (audioSource.isPlaying()) {
            audioSource.pause();
          } else if (audioSource.isPaused()) {
            audioSource.resume();
          }
          break;
      }
    }

    // Timer test - sleep for 2 seconds
    if (key.toLowerCase() === 'l') {
      lastSleepTime = like.timer.getTime();
      like.timer.sleep(2);
      sleepStatus = 'Timer sleep activated (2 seconds)';
      console.log('Timer sleeping for 2 seconds starting at:', lastSleepTime);
    }

    // Save/Load controls
    switch (key) {
      case 'F5':
        const state: GameState = {
          rotation: rotation,
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
      case 'F9':
        const loadedState = await like.localstorage.read<GameState>('demo_save');
        if (loadedState) {
          rotation = loadedState.rotation;
          currentSaveStatus = `Loaded from ${loadedState.savedAt}`;
          console.log('Loaded state:', loadedState);
        } else {
          currentSaveStatus = 'No save file found!';
        }
        break;
    }
  },
  
  mousepressed: (x: number, y: number, button: number) => {
    console.log('Mouse pressed at', x, y, 'button:', button);
  }
});

// Initialize and start
like.init(800, 600);
like.start();

