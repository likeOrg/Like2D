import { type ImageHandle } from "like2d/graphics";
import { createLike } from "like2d";

let image: ImageHandle;
const like = createLike(document.getElementById("game-container")!);

like.load = () => {
  like.canvas.setMode([800, 600]);
  image = like.gfx.newImage("pepper.png");
};

like.update = (_dt: number) => {
  // game logic here
};

like.draw = () => {
  like.gfx.clear([0.1, 0.1, 0.15, 1]);
  like.gfx.print("white", "Like2D Starter", [20, 20]);
  like.gfx.draw(image, like.mouse.getPosition());
};

await like.start();

document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
  like.canvas.setFullscreen(true);
});
