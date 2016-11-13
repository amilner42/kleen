# [Kleen](https://amilner42.github.io/kleen)

A typescript library which provides a very thin layer over the typescript
type system allowing you to extend the compile-time guarantees to run-time.
Using the [code generator](https://amilner42.github.io/kleen/#generator) you
can plug in some typescript `type`s/`interface`s from your project and you will
be given the objects to use at runtime! The objects you are given from the
generator cover the type validation for you completely, more importantly though,
they allow you to plug in `restriction`s (either sync/async) at any level making
it easy for you handle the data validation.

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


### [Website](https://amilner42.github.io/kleen)

You _probably_ should head to the website if you're just using the library,
there is a full tutorial on the website and also a code generator. If you're
planning on developing, then stay here, you're in the right place.


NOTE: I'm currently in the process of moving the tutorial to the website, so
for now you'll have to read the tutorial in this README.


### Full Tutorial (~10-15 minutes)

Code snippets assume you have `import * as kleen from "kleen"`.

Basics first, let's get ourselves a string.

```typescript

const stringSchema: kleen.primitiveSchema =
  {
    primitiveType: kleen.kindOfPrimitive.string,
  }
```

Note, because we don't hate ourselves, `stringType` really is a string,
not `null` or `undefined`. If we wanted to allow our data to be null/undefined
then we would:

```typescript
const stringOrNotSchema: kleen.primitiveSchema =
  {
    primitiveType: kleen.kindOfPrimitive.string,
    nullAllowed: true,
    undefinedAllowed: true
  }
```

Ok, how would we use these structures we've created? You silly, the library
has one method, what did you think we were going to do?!


```typescript
kleen.validModel(stringSchema)("asdf")
.then(() => {
  // Yay it's valid. In this case, it will be valid.
})
.catch((error) => {
  // `error` will be thrown by `validModel`, it will either be a default error
  // from kleen or some custom error you have attached. In this case, it will
  // not go the catch because "asdf" is a valid against the string schema.
});

```

You _may_ be confused looking at the notation: `validModel(...)(...)`, don't be,
`validModel` is simply curried. By allowing you to call one parameter at a time
you get the benefit of being able to succinctly create validators:

```typescript
const aValidString = kleen.validModel(stringSchema);

// And you can call it later with the remaining param:
//   aValidString("someString")
```

Ok, so you now know the entire API, let that soak in. Enough soaking. Seriously,
stop.

All we've done is check a primitive type. What `type`s can we check? We have the
following 4 schemas as building blocks.

```typescript
kleen.primitiveSchema // a primitive
kleen.objectSchema    // Good old regular { ... }
kleen.arraySchema     // Can't forget about [...]
kleen.unionSchema     // And lastly union types!
```

These 4 building blocks compose how we describe our data. If you got the
epiphany that this maps over to typescript, that's because it does. One
of the core ideas behind this library is to _take the typescript compile times
guarantees and extend them to runtime_. So if we wanted to create an object with
two properties, both strings, we would do:

```typescript
const basicUserSchema: kleen.objectSchema =
  {
    objectProperties: {
      email: stringSchema, // remember we defined `stringSchema` above
      password: stringSchema
    }
  }
```

Of course sub properties could be object themselves, in fact they could be any
of the 4 possible schemas listed above; the schemas are our building blocks.

Here is an example of an array model, this is an array at root level, not nested
in an object (same as we did above with the primitive, types do not need to be
nested in an object, think about it the same way as the typescript `type`).

```typescript
const arrayOfUsersSchema: kleen.arraySchema =
  {
    arrayElementType: {
      objectProperties: {
        "somePropertyName": {
          primitiveType: kleen.kindOfPrimitive.number
        }
      }
    }
  }

const validArray1 = [];
const validArray2 = [{ somePropertyName: 434}]

const invalidArray1 = undefined;
const invalidArray2 = [undefined];
const invalidArray3 = [ { somePropertyName: true }];
const invalidArray4 = [ { somePropertyName: 43, extraProperty: "uhoh" }];
const invalidArray5 = [ { }];
```

Ok, so the only thing you haven't seen me use is a `unionSchema`.


```typescript
const numberOrBoolSchema: kleen.unionSchema = {
  unionTypes: [
    {
      primitiveType: kleen.kindOfPrimitive.number
    },
    {
      primitiveType: kleen.kindOfPrimitive.boolean
    }
  ]
}

// Easy as that, you just specify all the `unionTypes`. In the case
// above both `5` and `true` would be valid models.
```

Ok so you now know how to validate basically any structure, at this point you
can basically extend your typescript compile time validation to runtime
validation.

But hold your horses captain, there's more. What if you don't _only_ care that
the type is correct, but also that some restrictions are met...perhaps you
want the `password` field to be more than 85 characters.

```typescript
const userWithPasswordRestrictionSchema: objectSchema = {
  objectProperties: {
    email: {
      primitiveType: kleen.kindOfPrimitive.string
    },
    password: {
      primitiveType: kleen.kindOfPrimitive.string,
      // To "fail" a restriction, all you have to do is return a rejected
      // promise, if you are writing sync code (like below) then you use
      // `Promise.reject` to create the rejected promise. If you are writing an
      // async restriction, then just make sure it rejects on failure.
      restriction: (password: string)  => {
        if(password.length <= 85) {
          return Promise.reject(
            // We can reject with anything we want, string/object, this is what
            // we will be given when `validModel` rejects (the `error` in the
            // catch block).
          );
        }
      }
    }
  }
}
```

Well there you go, now our users hate us as much as we hate them.

An important thing to note is that we didn't have to check that `password` was
a string and that it wasn't null/undefined inside our restriction, our **type
checking is always performed first and only on type-check-success are our
restrictions run**. We are *separating type-validation from data-validation*,
this is another core concept of this library.

In the example above, we could add a restriction on the object schema itself
(that restriction would be called with an `{ email: "...", password: "..."}`),
if our restriction needed access to both the email and the password at once.
For code-readability, you should always attach restrictions at the most specific
level, for example, you could attach our password restriction to the object
schema and simply get the `password` field from the object, but this makes
the code less readable and should be avoided. That being said, if we did add
a restriction on the object itself, by the time that restriction ran it'd not
only be guaranteed that the object it's given looks like
`{ email: "...", password: "..."}`, it'd also be guaranteed that `password` was
more than 85 chars, not only is type checking performed prior to restrictions,
**all sub-restrictions are ran first**.

Take a moment to really pat yourself on the back, you learnt a full new
library today. Enjoy that feeling. Ok stop.

You know how the type checking works, the null/undefined caveat, and how to add
custom restrictions and you know the order in which everything is run. It seems
like we know how to do everything...or do we...any keeners in the room notice
an important missing feature? Oh no one noticed...what does that say about the
people reading this tutorial...despicable....

The last important thing we need to be able to do, is send custom errors, not
only on restriction failures, but also on type failures. Let's add a custom
type failure error to our basic string type.

```typescript
const stringTypeCustomTypeError: kleen.primitiveSchema = {
  primtitiveType: kleen.kindOfPrimitive.string,
  typeFailureError: "Invalid model type, must be a string!"
}

validModel(stringTypeCustomTypeError)(null)
.then(() => {
  // Won't be called, null is not valid against the schema.
})
.catch((error) => {
  // Code will go here, error will be "Invalid model type, must be a string!".
});
```

And that's it! Now you can actually celebrate and I won't stop you. Ok no...
please stop...let's do a quick summary first.

##### Summary

`validModel` will guarantee the following about valid models:

1. There are no extra properties on objects in your model.
2. There are no missing properties on objects in your model.
3. Your model has the correct type.
4. Your model passes every single restriction.

In terms of the _way_ valid model works, we know that:

1. Valid model only runs restrictions after the type is confirmed to be correct.
  - You never need to waste time in your restrictions coding checks for the
    type of the object. We separate type validation and data validation.
2. Valid model only runs restrictions after sub-restrictions are met.
3. We can throw custom errors on type failure.
  - Use the `typeFailureError` field on any schema to specify what to do in case
    of type failure.
4. We can throw custom errors on restriction failures.
  - Async is fully supported (in fact it's a core part of the design), if you
    want to fail sync code then `Promise.reject` with an error, on the other
    hand if you use async code then just make sure it's rejecting on failure.

Ok...that's the entire library! Now go rejoice, embrace the new knowledge! I
won't judge you (more than I already do).


### What does this library not do?

This library does not do things like check that a string is a valid email or
a valid phone number etc...there are already hundreds of libraries that offer
thousands of functions that offer these basic functions, all of these libraries
will work perfectly with this one, and can be simply placed inside a
restriction.


### Contributing

Pull Requests / Issues always welcome.

Keep in mind the goal of this validation library is to stay *simple*, I will
likely reject any ideas (even good ones) that add too much complexity.


### Bugs

Make an issue, I'll try to respond ASAP.
