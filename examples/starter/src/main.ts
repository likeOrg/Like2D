import { Color, type ImageHandle } from "like2d/graphics";
import { createLike } from "like2d";
import { Vec2, Vector2 } from "like2d/math";
import { AudioSource } from "like2d/audio";

let drop: ImageHandle;
let dropp: AudioSource;
const like = createLike(document.querySelector('body')!);
let drops: Array<{birth: number, pos: Vector2}> = [];
let nextDropTime = 0;
let followMouseTime = 0;

like.load = () => {
  nextDropTime = like.timer.getTime() + 1;
  like.canvas.setMode([240, 160]);
  drop = like.gfx.newImage("drop.png");
  dropp = like.audio.newSource("dropp.ogg");
  dropp.audio.preservesPitch = false;
};

like.update = (dt: number) => {
  let time = like.timer.getTime();
  if (time > nextDropTime) {
    let pos =
      time - followMouseTime < 0.2
        ? like.mouse.getPosition()
        : Vec2.mul([Math.random(), Math.random() - 0.1], like.canvas.getSize());
    drops.push({birth: time, pos});
    nextDropTime = time + Math.random() / 2 + 0.2;
  }
  for (const {birth} of drops) 
    if (time - birth - dt > 2 != time - birth > 2) {
      dropp.audio.playbackRate = 2 ** ([0,4,7,11][Math.floor(Math.random()*4)] / 12);
      dropp.seek(0);
      dropp.play();
    }
  drops = drops.filter(d => time - d.birth < 8);
};

like.mousemoved = () => {
  followMouseTime = like.timer.getTime();
}

like.draw = () => {
  let time = like.timer.getTime();
  const dropOrigin = Vec2.mul(drop.size, [0.5, 0.8]);
  like.gfx.clear(`hsl(${Math.cos(time/10)*40+220}, 50%, 50%)`);
  like.gfx.print("white", "welcome to", [20, 20], { font: "10px sans" });
  like.gfx.print("white", "LÏKE (beta)", [80, 20]);

  for (let {birth, pos} of drops) {
    let age = time - birth;
    pos = Vec2.add(pos, [0, 40*Math.min(age, 2)]);
    if (age > 1.8) {
      let opacity = 2 - age / 4;
      let color: Color = [1,1,1,opacity];
      like.gfx.circle("line", color, pos, [(age - 1.8) * 20, (age - 1.8) * 10]);
    }
    if (age < 2) {
      let smush = (0.2 - Math.max(0, age - 1.8)) / 0.4;
      let wobble: Vector2 = [Math.sin(age*10), Math.cos(age*9)];
      let scale = Vec2.add(Vec2.mul(wobble, 0.2), [0.5/(smush+0.5), smush]);
      like.gfx.draw(drop, pos, { origin: dropOrigin, scale });
    }
  }
};

await like.start();

document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
  like.canvas.setFullscreen(true);
});
