import type { Graphics } from './core/graphics';
import type { Audio } from './core/audio';
import type { Input } from './core/input';
import type { Timer } from './core/timer';
import type { Event } from './core/events';
import type { Vector2 } from './core/vector2';

export type EngineDeps = {
  graphics: Graphics;
  input: Input;
  timer: Timer;
  audio: Audio;
};

export type EventCallback = (event: Event) => void;

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private deps: EngineDeps;
  private isRunning = false;
  private lastTime = 0;
  private eventCallbacks: EventCallback[] = [];
  
  constructor(container: HTMLElement, deps: EngineDeps) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.display = 'block';
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    this.deps = deps;
    this.deps.graphics.setContext(this.ctx);
    
    container.appendChild(this.canvas);
    
    this.setupInputHandlers();
  }
  
  private setupInputHandlers(): void {
    window.addEventListener('keydown', (e) => {
      this.emit({
        type: 'keypressed',
        scancode: e.code,
        keycode: e.key,
      });
    });

    window.addEventListener('keyup', (e) => {
      this.emit({
        type: 'keyreleased',
        scancode: e.code,
        keycode: e.key,
      });
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.emit({
        type: 'mousepressed',
        position: [e.clientX - rect.left, e.clientY - rect.top] as Vector2,
        button: e.button + 1,
      });
    });

    this.canvas.addEventListener('mouseup', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.emit({
        type: 'mousereleased',
        position: [e.clientX - rect.left, e.clientY - rect.top] as Vector2,
        button: e.button + 1,
      });
    });
  }
  
  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      const idx = this.eventCallbacks.indexOf(callback);
      if (idx !== -1) this.eventCallbacks.splice(idx, 1);
    };
  }
  
  emit(event: Omit<Event, 'timestamp'>): void {
    const fullEvent = { ...event, timestamp: this.deps.timer.getTime() } as Event;
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }
  
  start(onUpdate?: (dt: number) => void, onDraw?: () => void) {
    this.isRunning = true;
    this.lastTime = performance.now();
    
    const loop = () => {
      if (!this.isRunning) return;
      
      const currentTime = performance.now();
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      
      this.deps.timer.update(dt);
      
      const inputEvents = this.deps.input.update();
      
      for (const action of inputEvents.pressed) {
        this.emit({ type: 'actionpressed', action });
      }
      for (const action of inputEvents.released) {
        this.emit({ type: 'actionreleased', action });
      }
      for (const event of inputEvents.gamepadPressed) {
        this.emit({
          type: 'gamepadpressed',
          gamepadIndex: event.gamepadIndex,
          buttonIndex: event.buttonIndex,
          buttonName: event.buttonName,
          rawButtonIndex: event.rawButtonIndex,
        });
      }
      for (const event of inputEvents.gamepadReleased) {
        this.emit({
          type: 'gamepadreleased',
          gamepadIndex: event.gamepadIndex,
          buttonIndex: event.buttonIndex,
          buttonName: event.buttonName,
          rawButtonIndex: event.rawButtonIndex,
        });
      }
      
      this.emit({ type: 'update', dt });
      if (onUpdate) onUpdate(dt);
      
      this.deps.graphics.clear();
      this.emit({ type: 'draw' });
      if (onDraw) onDraw();
      
      requestAnimationFrame(loop);
    };
    
    this.emit({ type: 'load' });
    
    requestAnimationFrame(loop);
  }
  
  stop() { 
    this.isRunning = false;
  }
  
  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  getTime(): number {
    return this.deps.timer.getTime();
  }
  
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }
}