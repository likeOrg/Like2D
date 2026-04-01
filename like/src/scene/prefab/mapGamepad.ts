/**
 * An automagical gamepad mapper.
 *
 * ```ts
 * like.gamepadconnected = (index) =>
 *   scenes.push(mapGamepad({ buttons: buttonSetGBA, sticks: 0 }), index)
 * ```
 *
 * Add this to your codebase and activating a gamepad causes a button mapping screen to pop up.
 * It will request to map any buttons not already covered by the automapping database.
 *
 * If you're wondering what `scenes` refers to, check out {@link SceneManager} to
 * get started.
 *
 * Note: many browsers only fire gamepadconnected on first button press, so always writing "P2: press any button" is a fine idea.
 * @module scene/prefab/mapGamepad
 */

import type { Scene, SceneManager } from "../";
import type { Like } from "../..";
import type { Color, PrintProps } from "../../graphics";
import { type LikeButton, defaultMapping, GamepadMapping } from "../../input";
import { Vector2 } from "../../math/vector2";

const mapOrder: LikeButton[] = [
  "BRight",
  "BBottom",
  "Up",
  "Down",
  "Left",
  "Right",
  "MenuLeft",
  "MenuRight",
  // 8: NES buttons
  "L1",
  "R1",
  // 10: GBA buttons
  "BLeft",
  "BTop",
  // 12: SNES buttons
  "L2",
  "R2",
  // 14: PS1 buttons
  "LeftStick",
  "RightStick",
];

export const buttonSetNES = new Set<LikeButton>(mapOrder.slice(0, 8));
export const buttonSetGBA = new Set<LikeButton>(mapOrder.slice(0, 10));
export const buttonSetSNES = new Set<LikeButton>(mapOrder.slice(0, 12));
export const buttonSetPS1 = new Set<LikeButton>(mapOrder.slice(0, 14));
export const buttonSetAll = new Set<LikeButton>(mapOrder);

const drawCircButt = (pos: Vector2, size: number) => (like: Like, color: Color) =>
  like.gfx.circle("fill", color, pos, size);

const drawDpadPart = (rot: number) => (like: Like, color: Color) => {
  like.gfx.withTransform(() => {
    like.gfx.translate([2.5, 6]);
    like.gfx.rotate(rot);
    like.gfx.rectangle("fill", color, [0.5, -0.5, 1.3, 1]);
  });
};

const drawShoulder = (y: number, width: number, flip: boolean) => (like: Like, color: Color) => {
    const r = 0.8;
    const rectPos: Vector2 = [5-width, y];
    const circPos: Vector2 = [5-width-r, y];
    like.gfx.withTransform(() => {
        if (flip) {
            like.gfx.translate([16, 0]);
            like.gfx.scale([-1, 1]);
        }
        like.gfx.circle("fill", color, circPos, r, { arc: [Math.PI, Math.PI*3/2], center: false });
        like.gfx.rectangle("fill", color, [...rectPos, width, r]);
    });
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
  Up: { draw: drawDpadPart(-Math.PI / 2) },
  Left: { draw: drawDpadPart(Math.PI) },
  Down: { draw: drawDpadPart(Math.PI / 2) },
};

export type MapMode = {
  buttons: Set<LikeButton>;
  stickCount: number;
};

/**  The gamepad mapping scene factory. Call this and pass it into {@link SceneManager.push} */
export const mapGamepad = (
  mapMode: MapMode,
  targetPad: number,
): Scene => (like: Like, scenes: SceneManager) => {
  const currentlyUnmapped: LikeButton[] = [];
  const mapping: GamepadMapping = like.gamepad.getMapping(targetPad) ?? defaultMapping(2);
  const alreadyMapped = new Set<number>();
  let held: LikeButton | undefined;
  let frameWait = 10;

  const alreadyMappedValues = new Set(Object.values(mapping.buttons));

  for (const btn of mapOrder.reverse()) {
    if (mapMode.buttons.has(btn) && !alreadyMappedValues.has(btn)) {
      currentlyUnmapped.push(btn);
    }
  }

  like.canvas.setMode([320, 240]);

  return {
    update() {
      frameWait--;
    },

    draw() {
      const centerText: PrintProps = {
          font: "1px sans-serif",
          align: "center",
          width: 16,
      }
      const active = currentlyUnmapped.at(-1);
      like.gfx.clear();
      like.gfx.scale(20);
      like.gfx.translate([0, 1]);
      like.gfx.print(
        "white",
        `Map gamepad ${targetPad}`,
        [8, 0.0],
        centerText,
      );
      for (const prop of mapMode.buttons.keys()) {
        const color =
          held == prop
            ? "green"
            : active == prop
              ? "red"
              : mapMode.buttons.has(prop)
                ? "gray"
                : "black";
        buttonProps[prop].draw(like, color);
      }
      like.gfx.print(
        "white",
        active
          ? `Press ${like.gamepad.fullButtonName(active)}!`
          : "Press any button to resume.",
        [2, 10],
        { font: "1px sans-serif" },
      );
    },

    gamepadpressed(
      source: number,
      _name: LikeButton,
      num: number,
    ) {
      if (source !== targetPad || held || frameWait > 0) return;
      const active = currentlyUnmapped.pop();
      if (active && !alreadyMapped.has(num)) {
        alreadyMapped.add(num);
        mapping.buttons[num] = active;
        held = active;
      } else if (!active) {
        like.gamepad.setMapping(targetPad, mapping);
        setTimeout(() => scenes.pop(), 100);
      }
    },

    gamepadreleased(
      source: number,
      _name: LikeButton,
      num: number,
    ) {
      if (source !== targetPad) return;
      if (held == mapping.buttons[num]) {
        held = undefined;
      }
    },

    mousepressed() {
      scenes.pop();
    }
  };
};
