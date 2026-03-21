import { describe, it, expect } from 'vitest';
import { GamepadMapping, identityMap } from "../core/gamepad-mapping"

    // new GamepadMapping({id: "0420-a695-PissPad Big Boy Playtime", mapping: "blah"} as any);
    // new GamepadMapping({id: "045e-0b20-Should be XBOne", mapping: "blah"} as any);
    // new GamepadMapping({id: "Game sir! (Vendor: 05ac Product: 055b)", mapping: "blah"} as any);

describe("Db lookup", () => {
    it("Fail to find firefox gamepad in db", () => {
        expect(new GamepadMapping({id: "9999-0000-ButterPad", mapping: ""} as any)).toMatchObject(
            { vendor: 0x9999, product: 0, name: "ButterPad", sdlName: "Unknown", mapping: identityMap }
        )
    })
    it("Find Xbox controller with Firefox Format", () => {
        expect(new GamepadMapping({id: "045e-0b20-Should be Xbox", mapping: "blah"} as any)).toMatchObject(
            { vendor: 0x045e, product: 0x0b20, name: "Should be Xbox", sdlName: "Xbox Wireless Controller" }
        )
    })
    it("Find gameSir with Chrome Format", () => {
        expect(new GamepadMapping({id: "GameSir (Vendor: 05ac Product: 055b)", mapping: "blah"} as any)).toMatchObject(
            { vendor: 0x05ac, product: 0x055b, name: "GameSir", sdlName: "GameSir G3w" }
        )
    })
})