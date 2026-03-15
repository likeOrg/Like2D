Our spec/ folder is to codify decision decisions and philosophy, not to specify every single part of the API.

We prefer type over interface.

Don't overuse OOP. Avoid field privacy and heavy use of getters or setters.

There should always be a means to get the underlying HTML element or API type of an abstraction.

We should never add things to our library where the average dev would reasonably prefer the raw API.

We should never add functions for simple, one-line operations unless exceedingly common.

Avoid any function overloads that can change the positionality of arguments. i.e.
getJoystick(1, "A")
getJoystick("A")
Or which combine logic which has nothing in common.

We use modern JS: spread operators, iterators, etc.

Update the demo after framework changes to demo features and reflect current best practices.
