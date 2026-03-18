Like2D is roughly using semver, but we never had a V0.

### V1 - birth
**TOTALLY UNSTABLE API**
The place where we proved that Like2D was possible to build.

### V2 - growth
**Gradual stabilization of API**
The place where we solved our basic architecture and API.
We build out something usable, but never too large to be flexible.

### V3 - maturity
**Relatively stable API**

see docs/V3.md

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

### V4 -  stability
**Stable API**

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
