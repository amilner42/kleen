# [Kleen](https://amilner42.github.io/kleen)

NOTE: I am not currently developing this library and it is missing some key
features so I probably wouldn't recommend using it right now, there are
likely better validation libraries.

A typescript library which provides a very thin layer over the typescript
type system allowing you to extend the compile-time guarantees to run-time.
Using the [code generator](https://amilner42.github.io/kleen/#generator) you
can plug in some typescript `type`s/`interface`s from your project and you will
be given the objects to use at runtime! The objects you are given from the
generator cover the type validation for you completely, more importantly though,
they allow you to plug in `restriction`s (either sync/async) at any level making
it easy for you to handle data validation as well as type validation.

In short, this library will:
  - Improve your runtime validation (do you check ALL user generated input?)
  - Save you time (plug in interfaces, get auto-generated type validation objects)
  - Handle all your async for you, the order in which it gets run etc...
  - Vastly improve the readability of your code.

It's also designed to be so simple that you can learn the entire library
(every corner of it) in 15 minutes. Guaranteed or you get your money back.


### Download

`npm install kleen --save`

This is a strongly-typed npm package, so typings work out of the box.


### Tutorial

The tutorial sits on the main website, right
[here](https://amilner42.github.io/kleen/#tutorial).


### Generator

Plug in `type`s/`interface`s and get out kleen schemas! You can find the
generator on the main website right
[here](https://amilner42.github.io/kleen/#generator).


### Contributing

Pull Requests / Issues always welcome.

Keep in mind the goal of this validation library is to stay *simple*, I will
likely reject any ideas (even good ones) that add too much complexity.


### Bugs

Make an issue, I'll try to respond ASAP.
