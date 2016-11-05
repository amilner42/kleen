# Kleen

A typescript library for *simple* data validation. Simplicity is the main goal
behind the design of the API, hence why only a single method is exposed:
`validModel`. You should be able to get up and running and be productive within
half an hour (if not faster). The main idea is that the shape of our data
validation should be the same shape as the data we are validating, making our
code more readable by avoiding the imperative mess we often get when validating
our data models as well as keeping our code DRY.


### What exactly does this library do?

`validModel` will guarantee the following 4 things about the structure of a
model.

1. There are no extra properties on an object that you don't expect
2. There are no missing properties on an object that you expected.
3. Every property on your object has the correct type.
4. Every property on your object passes it's optional restriction.

While I'm using the word "object" here, it's not necessary that your "model" be
an object, it could be an array, a primitive, a union of different types, etc...
_Most_ things supported in Typescript types are supported in this library.

For now you are allowed to use the following building blocks to build your
structures:
  - Primitives
  - Arrays of `type`
  - Objects with properties, where each property has a `type`.
  - Unions of `type`s

This should cover basically any JSON structure you are anticipating to receive.


### What does this library not do?

This library does not do things like check that a string is a valid email or
a valid phone number etc...there are already hundreds of libraries that offer
thousands of functions that offer these basic functions, all of these libraries
will work perfectly with this one, and can be simply placed inside a
restriction.


### Restrictions

Restrictions are simple, at any point of a "model" we should be able to check
things beyond the type itself, for example you might not only require that a
user model has a string type for the email field, but also that the string is
a valid email - this is exactly what restrictions allow.

Restrictions are _always_ run after the type has been checked, so you need not
waste your time checking that the type is correct or that the type is not
null/undefined, you can get straight into the juicy part, making that sexy
regex to ensure the user email is indeed an email.

But wait, what if I need to run an async restrictions! Don't worry - of course
the restrictions support async. Sticking with our user example, this allows you
to do things like check that email doesn't already exist in the database
(normally queries to the db are async).

But wait, what if I need to throw custom errors! If the user is already in the
database then I need to send a message to the front-end to let the user now that
this was the problem (on the other hand if the password is too weak we need to
tell the user to enter a stronger password). Not to worry, restrictions also
support custom error messages, in fact that's a core part of the way
restrictions work, that way when validation fails you know exactly what went
wrong and can handle the situation appropriately.

### Null is a string right? Let's append something...huh..an error...

One of my least favorite parts of working with Typescript (and many other
languages) is that null/undefined are all types...well not at runtime...This is
not the case in languages like Elm/Haskell (and others...) where a string is
actually a string, what a treat! To Typescript's defense, you can pass a flag
to the compiler that turns off this behavior (you should _probably_ do that)
and forces you to write better code.

By default, if you say that you expect `email` to be of type string, or perhaps
you expect it to be an array of integers, this library assumes you really mean
that. If you want to allow an object to be null or undefined, you have to
specify that, most of the time you don't so the default behavior has been chosen
to be the most common and safest.


### Examples

The best way to learn is to take a look at some examples, the API after all is
incredibly *simple*. Simply head over to my [tests](TODO) and it should all
become clear!


### Contributing

Pull Requests / Issues always welcome.

Keep in mind the goal of this validation library is to stay *simple*, I will
likely reject any ideas (even good ones) that add too much complexity.


### Bugs

Make an issue, I'll try to respond ASAP.
