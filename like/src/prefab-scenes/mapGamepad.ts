import { Color, Like, LikeButton } from "..";
import { defaultMapping, GamepadMapping } from "../core/gamepad";
import { Vector2 } from "../math/vector2";
import { Scene } from "../scene";

export const buttonSetNES = new Set<LikeButton>([
  "BBottom",
  "BRight",
  "MenuRight",
  "MenuLeft",
  "Down",
  "Left",
  "Right",
  "Up",
]);
export const buttonSetSNES = buttonSetNES.union(
  new Set<LikeButton>(["BLeft", "BTop", "L1", "R1"]),
);
export const buttoSetPS1 = buttonSetSNES.union(
  new Set<LikeButton>(["L2", "R2"]),
);
export const buttonSetAll = buttoSetPS1.union(
  new Set<LikeButton>([
    "LeftStick",
    "RightStick",
  ]),
);

const mapOrder: LikeButton[] = [
  "BBottom",
  "BRight",
  "BLeft",
  "BTop",
  "Down",
  "Right",
  "Left",
  "Up",
  "L1",
  "L2",
  "R1",
  "R2",
  "MenuLeft",
  "MenuRight",
  "LeftStick",
  "RightStick",
];

const drawCircButt = (pos: Vector2, size: number) => (like: Like, color: Color) =>
  like.gfx.circle("fill", color, pos, size);

const drawDpadPart = (rot: number) => (like: Like, color: Color) => {
  like.gfx.push();
  like.gfx.translate([2.5, 6]);
  like.gfx.rotate(rot);
  like.gfx.rectangle("fill", color, [0.5, -0.5, 1.3, 1]);
  like.gfx.pop();
};

const drawShoulder = (y: number, width: number, flip: boolean) => (like: Like, color: Color) => {
    const r = 0.8;
    const rectPos: Vector2 = [5-width, y];
    const circPos: Vector2 = [5-width-r, y];
    like.gfx.push()
    if (flip) {
        like.gfx.translate([16, 0]);
        like.gfx.scale([-1, 1]);
    }
    like.gfx.circle("fill", color, circPos, r, { arc: [Math.PI, Math.PI*3/2], center: false });
    like.gfx.rectangle("fill", color, [...rectPos, width, r]);
    like.gfx.pop();
}

// Buttons assume a centered resolution of 16x9px. Transforms exist for a reason lol.

//      LLLLL           .             RRRRR
//     LLLLLLLLL        .          RRRRRRRRR
//                      .                  
//       DDD         S  .  S              B
// -.....DDD.....................................
//    DDD   DDD         .           B        B
//       DDD      LS    .    RS
//       DDD            .              B 
//                      .   

const buttonProps: Record<
  LikeButton,
  { draw: (like: Like, color: Color) => void }
> = {
  BLeft: { draw: drawCircButt([12, 6], 0.8) },
  BRight: { draw: drawCircButt([15, 6], 0.8) },
  BTop: { draw: drawCircButt([13.5, 4.5], 0.8) },
  BBottom: { draw: drawCircButt([13.5, 7.5], 0.8) },
  MenuLeft: { draw: drawCircButt([6, 4], 0.5) },
  MenuRight: { draw: drawCircButt([10, 4], 0.5) },
  LeftStick: { draw: drawCircButt([6.5, 7], 1.4) },
  RightStick: { draw: drawCircButt([9.5, 7], 1.4) },
  L1: { draw: drawShoulder(2, 3, false) },
  L2: { draw: drawShoulder(1, 2, false) },
  R1: { draw: drawShoulder(2, 3, true) },
  R2: { draw: drawShoulder(1, 2, true) },
  Right: { draw: drawDpadPart(0) },
  Up: { draw: drawDpadPart(-Math.PI/2) },
  Left: { draw: drawDpadPart(Math.PI) },
  Down: { draw: drawDpadPart(Math.PI/2) },
};

export type MapMode = {
  buttons: Set<LikeButton>;
  stickCount: number;
};

export class MapGamepad implements Scene {
  private currentlyUnmapped: LikeButton[] = [];
  private mapping: GamepadMapping = defaultMapping(2);
  private held?: LikeButton;
  private alreadyMapped = new Set<Number>();

  constructor(
    private mapMode: MapMode,
    private targetPad: number,
    private next?: Scene,
  ) {}

  load(like: Like): void {
    for (const btn of mapOrder.reverse()) {
      if (this.mapMode.buttons.has(btn)) {
        this.currentlyUnmapped.push(btn);
      }
    }
    this.mapping.buttons.clear();
    like.canvas.setMode([320, 240]);
  }

  draw(like: Like): void {
    const centerText = {
        font: "1px serif",
        align: "center",
        width: 16,
    }
    const active = this.currentlyUnmapped.at(-1);
    like.gfx.clear();
    like.gfx.scale(20);
    like.gfx.translate([0, 1]);
    like.gfx.print(
        "white", "GAMEPAD MAPPING", [0.2, 0.2], centerText
    );
    for (const prop of this.mapMode.buttons.keys()) {
      const color =
        this.held == prop
          ? "green"
          : active == prop
            ? "red"
            : this.mapMode.buttons.has(prop)
              ? "gray"
              : "black";
      buttonProps[prop].draw(like, color);
    }
    like.gfx.print(
      "white",
      active
        ? `Press input for ${active}!`
        : "Good, press any button to start.",
      [2, 10],
      { font: "1px serif" },
    );
  }

  gamepadpressed(
    like: Like,
    source: number,
    _name: LikeButton,
    num: number,
  ): void {
    if (source !== this.targetPad || this.held) return;
    const active = this.currentlyUnmapped.pop();
    if (active && !this.alreadyMapped.has(num)) {
      this.alreadyMapped.add(num);
      this.mapping.buttons.set(num, active);
      this.held = active;
    } else if (!active) {
      like.gamepad.setMapping(this.targetPad, this.mapping);
      setTimeout(() => like.setScene(this.next), 100);
    }
  }

  gamepadreleased(
    _like: Like,
    source: number,
    _name: LikeButton,
    num: number,
  ): void {
    if (source !== this.targetPad) return;
    console.log(this.held, this.mapping.buttons.get(num))
    if (this.held == this.mapping.buttons.get(num)) {
      this.held = undefined;
    }
  }

  mousepressed(like: Like): void {
    like.setScene(this.next);
  }
}
