/**
 * Calculate the scale and offset for rendering fixed-size content to a target canvas.
 * This is useful when you want to render in "native" mode but maintain a fixed game resolution.
 *
 * @param canvasSize - The actual canvas size in pixels
 * @param gameSize - The desired game resolution (fixed size)
 * @returns Object containing the scale factor and offset for centering
 */
export function calcFixedScale(canvasSize, gameSize) {
    const scale = Math.min(canvasSize[0] / gameSize[0], canvasSize[1] / gameSize[1]);
    const scaledGame = [gameSize[0] * scale, gameSize[1] * scale];
    const offset = [(canvasSize[0] - scaledGame[0]) * 0.5, (canvasSize[1] - scaledGame[1]) * 0.5];
    return { scale, offset };
}
