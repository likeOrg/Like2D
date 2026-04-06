/**
 * Where {@link Keyboard}, {@link Mouse}, {@link Gamepad}, and actions in {@link Input} reside.
 * @module input
*/

export type { Keyboard } from "./keyboard";
export type { Mouse } from "./mouse";
export type { Gamepad } from "./gamepad";
export type { Input } from "./input";

export type {
  MouseSetMode,
  MouseMode,
  MouseButton,
} from "./mouse";

export type {
  GamepadTarget,
} from "./gamepad"

export type {
  LikeButton,
  GamepadMapping,
  ButtonMapping,
  StickMapping,
  StickAxisMapping,
} from "./gamepad-mapping";

export type {
  InputType,
  InputBinding,
} from "./input";
