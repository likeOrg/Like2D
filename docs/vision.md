### Current State

LIKE's API is unstable because it is still developing.

The structure and features are mostly fleshed out at this point.

### Long term vision (summary)

see `docs/long_term_work.md`

Confident in our basis, we fill in the blind spots of this framework.

Goals:
 - Identify and reinforce real-world usage patterns of LIKE
 - Recreate more functions of love2d, if relevant
 - Wrap more functionality of Canvas
 - Investigate other browser APIs
 - Consider recreating functionality from popular love2d libraries

Methods:
 - Adding to LIKE.
 - Making it easier to plug libraries into LIKE.
 - Leaving things to the Community.
 - Creating official libraries for things like Camera
 - Breaking API to split things off into libraries, if relevant.

# Caveats
Look at V4. We don't want to fly too close to the sun.
In other words, don't go too deeply into your local maximum.
Because sometimes, there's another one nearby.

### Extra long term vision

Here we will consider crazy ideas such as:
 - software-rendered pixel graphics, likely running on Emscripten
 - WebGL-rendered graphics...in general
 - making portable standalone apps from our games
 - Not just Web Audio API, but WebAudioWorklet for sound generation.
 - multithreading
 - networking
 - integrating with clojure, gleam, or other compile-to-js langs.
 - integrating with emscripten somehow -- let's make LIKE games in C!!
 - making an online LIKE IDE
