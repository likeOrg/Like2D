import like from './like/index.ts';

// Example usage - users will override these callbacks
like.setCallbacks({
  load: () => {
    console.log('Game loaded!');
  },
  
  update: (_dt: number) => {
    // Game logic here - dt is delta time in seconds
  },
  
  draw: () => {
    const ctx = like.getContext();
    if (ctx) {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(0, 0, like.getWidth(), like.getHeight());
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Like2D Framework', like.getWidth() / 2, like.getHeight() / 2);
    }
  },
  
  keypressed: (key: string) => {
    console.log('Key pressed:', key);
  }
});

// Initialize and start
like.init(800, 600);
like.start();
