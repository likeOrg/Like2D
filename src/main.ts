import like from './like/index.ts';

// Example demonstrating Like2D graphics API
let rotation = 0;
let pepperImage: Awaited<ReturnType<typeof like.graphics.newImage>> | null = null;

like.setCallbacks({
  load: async () => {
    console.log('Game loaded!');
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
    
    // Print instructions
    like.graphics.setColor(0.6, 0.6, 0.6, 1);
    like.graphics.setFont(16);
    like.graphics.print('Press any key to see it logged', 20, like.getHeight() - 50);
    like.graphics.print('Click anywhere for mouse position', 20, like.getHeight() - 30);
    like.graphics.print('Images: normal (top-right), scaled, rotated, and cropped quad', 20, like.getHeight() - 10);
  },
  
  keypressed: (key: string) => {
    console.log('Key pressed:', key);
  },
  
  mousepressed: (x: number, y: number, button: number) => {
    console.log('Mouse pressed at', x, y, 'button:', button);
  }
});

// Initialize and start
like.init(800, 600);
like.start();
