LÏKE2D is mostly built on solving invisible problems. Unknown unknowns.

It's a platform, first and foremost.
This is especially true of early versions.

Its goal is yes, make game development easier, but it doesn't
attempt to solve most problems that could or should be solved
in a diversity of ways. The rule is this:

Imagine a highly competent game developer. What does he/she want?
What do they not want?

Examples:
 - They want it to be easy to maintain a sharp native-res canvas
 - They want it to be easy to get sharp pixel prescaling
 - They don't want a pixelart game with linear scaling or mixels
 - They want customizable inputs
 - They don't want to hardcode keyboard bindings
 - They want to implement many of their own systems
 - They don't neccessarily want a predefined game object model.
   - They want freedom to choose OOP, ECS, etc. or their own thing
 
If our feature meets 99.5% of these wants, we force it on. Forking is always an option.

If it meets 50%, we keep it IF it's easy to turn it off / choose.

And if it meets less than 20%, we strip it away ESPECIALLY if
it could have just been an external library.
 
