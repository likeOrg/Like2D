
For a list of all possible play and update parameters, {@link ChannelState | check ChannelState.}

## Basic usage

```js
const wave = like.audio.newWave("beanBlast.ogg")

like.actionpressed = (action) => {
    if (action == "blast") {
        like.audio.play(wave, { 
            index: 0, // channel index, omit to use polyphony
            speed: blastPower, // affects speed and pitch
            volume: 0.5,
            seek: 0.0, // start position
            loop: false,
        })
    }
}
```

When a sound is playing, it can be manipulated just the same with `update`.


```js
// keep track of channels to manipulate playing sounds
const channel = like.audio.play(wobbleWave);

like.update = (dt) => {
    // pass in the channel index
    like.audio.update({ index: channel, speed: wobbleRate })
}

like.actionpressed = (action) => {
    if (action == "scrub_left") {
        const status = like.audio.status(channel);
        // if status is null, the sound ended.
        if (status) {
            like.audio.update({ index: channel, seek: status.seek - 0.5 });
        }
    }
}
```
