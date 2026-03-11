export interface Scene {
  width: number;
  height: number;
  load?: () => void;
  update: (dt: number) => void;
  draw: () => void;
  keypressed?: (scancode: string, keycode: string) => void;
  keyreleased?: (scancode: string, keycode: string) => void;
  mousepressed?: (x: number, y: number, button: number) => void;
  mousereleased?: (x: number, y: number, button: number) => void;
  actionpressed?: (action: string) => void;
  actionreleased?: (action: string) => void;
  gamepadpressed?: (gamepadIndex: number, buttonIndex: number, buttonName: string) => void;
  gamepadreleased?: (gamepadIndex: number, buttonIndex: number, buttonName: string) => void;
}
