# Kleen

A typescript library for *simple* data validation. Simplicity is the main goal
behind the design of the API, hence why only a single method is exposed:
`validModel`. You should be able to get up and running and be productive within
10 - 15 minutes. The main idea is that the shape of our data
validation should be the same shape as the data we are validating, making our
code more readable by avoiding the imperative mess we often get when validating
our data models as well as keeping our code DRY.


### Download

`npm install kleen --save`

This is a strongly-typed npm package, so typings work out of the box.


### Examples

The best way to learn is to take a look at some examples, the API after all only
has a single method. Head over to my [tests](tests/main.test.ts) to see the
spec and get a feel for the library, but if you prefer to see an example from
a live open source project, head over [here](https://github.com/amilner42/less-money-more-happy/tree/cleaning-refactor/backend/src/models)
and check out any of those models, they all use **kleen** for validation to
keep the database and the code "kleen". You can also see a few live examples of
using **kleen** to create Express passport-local [login](https://github.com/amilner42/less-money-more-happy/blob/cleaning-refactor/backend/src/passport-local-auth-strategies.ts#L76)
and [register](https://github.com/amilner42/less-money-more-happy/blob/cleaning-refactor/backend/src/passport-local-auth-strategies.ts#L170)
strategies.


### Full Tutorial (~10-15 minutes)

So you were too lazy to go to the examples, I should've known I'd find you here.

Code snippets assume you have `import * as kleen from "kleen"`.

Basics first, let's get ourselves a string.

```typescript

const stringType: kleen.primitiveStructure =
  {
    kindOfType: kleen.kindOfType.primitive,
    kindOfPrimitive: kleen.kindOfPrimitive.string,
  }
```

Note, because we don't hate ourselves, `stringType` really is a string,
not `null` or `undefined`. If we wanted to allow our data to be null/undefined
then we would:

```typescript
const stringAllowingNullOrUndefinedType: kleen.primitiveStructure =
  {
    kindOfType: kleen.kindOfType.primitive,
    kindOfPrimitive: kleen.kindOfPrimitive.string,
    nullAllowed: true,
    undefinedAllowed: true
  }
```

Ok, how would we use these structures we've created? You silly, the library
has one method, what did you think we were going to do?!


```typescript

kleen.validModel(stringType)("asdf")
.then(() => {
  // yay it's valid.
})
.catch((error) => {
  // `error` will be thrown by `validModel`, it will either be a default error
  // from kleen or some custom error you have attached.
});

```

You _may_ be confused looking at the notation: `validModel(...)(...)`, don't be,
`validModel` is simply curried. By allowing you to call one parameter at a time
you get the benefit of being able to succinctly create validators:

```typescript
const aValidString = kleen.validModel(stringType);

// And you can call it later with the remaining param:
//   aValidString("someString")
```

Ok, so you now know the entire API, let that soak in. Enough soaking. Seriously,
stop.

All we've done is check a primitive type. What `type`s can we check? We have the
following 4 structures as building blocks.

```typescript
kleen.primitiveStructure // a primitive
kleen.objectStructure    // Good old regular { ... }
kleen.arrayStructure     // Can't forget about [...]
kleen.unionStructure     // And lastly union types!

// These will map to the following `kindOfType`s respectively. Every structure
// specifies it's `kindOfType`.

kleen.kindOfType.primitive
kleen.kindOfType.object
kleen.kindOfType.array
kleen.kindOfType.union
```

These 4 building blocks compose how we describe our data. If you got the
epiphany that this maps over to typescript, that's because it does. One
of the core ideas behind this library is to _take the typescript compile times
guarantees and extend them to runtime_. So if we wanted to create an object with
two properties, both strings, we would do:

```typescript
const basicUserType: kleen.objectStructure =
  {
    kindOfType: kleen.kindOfType.object,
    properties: {
      email: stringType, // remember we defined `stringType` above
      password: stringType
    }
  }
```

Of course sub properties could be object themselves, in fact they could be any
of the 4 possible `typeStructure`s, our building blocks.

Here is an example of an array model, this is an array at root level, not nested
in an object (same as we did above with the primitive, types do not need to be
nested in an object, think about it the same way as the typescript `type`).

```typescript
const arrayOfUsers: kleen.arrayStructure =
  {
    kindOfType: kleen.kindOfType.array,
    elementType: {
      kindOfType: kleen.kindOfType.object,
      properties: {
        "somePropertyName": {
          kindOfType: kleen.kindOfType.primitive,
          kindOfPrimitive: kleen.kindOfPrimitive.number
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

Ok, so the only thing you haven't seen me use is a `unionStructure`.


```typescript
const numberOrBool: kleen.unionStructure = {
  kindOfType: kleen.kindOfType.union,
  types: [
    {
      kindOfType: kleen.kindOfType.primitive,
      kindOfPrimitive: kleen.kindOfPrimitive.number
    },
    {
      kindOfType: kleen.kindOfType.primitive,
      kindOfPrimitive: kleen.kindOfPrimitive.boolean
    }
  ]
}

// Easy as that, you just specify all the `types` in the union. In the case
// above both `5` and `true` would be valid models.
```

Ok so you now know how to validate basically any structure, at this point you
can basically extend your typescript compile time validation to runtime
validation.

But hold your horses captain, there's more. What if you don't _only_ care that
the type is correct, but also that some restrictions are met...perhaps you
want the `password` field to be more than 85 characters.

```
const userTypeWithPasswordRestriction: objectStructure = {
  kindOfType: kleen.kindOfType.object,
  properties: {
    email: {
      kindOfType: kleen.kindOfType.primitive,
      kindOfPrimitive: kleen.kindOfPrimitive.string
    },
    password: {
      kindOfType: kleen.kindOfType.primitive,
      kindOfPrimitive: kleen.kindOfPrimitive.string,
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

In the example above, we could add a restriction on the object structure itself
(that restriction would be called with an `{ email: "...", password: "..."}`),
if our restriction needed access to both the email and the password at once.
For code-readibility, you should always attach restrictions at the most specific
level, for example, you could attach our password restriction to the object
structure and simply get the `password` field from the object, but this makes
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
const stringTypeCustomTypeError: kleen.primitiveStructure = {
  kindOfType: kleen.kindOfType.primtive,
  kindOfPrimitive: kleen.kindOfPrimitive.string,
  customErrorOnTypeFailure: "Invalid model type, it must be a string!"
}

validModel(stringTypeCustomTypeError)(null)
.then(() => {
  // wont be called
})
.catch((error) => {
  // code will go here, error will be === "Invalid model type, it must be a string!"
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
2. Valid model only runs restrictions after sub-restrictions are met.
3. We can throw custom errors on type failure.
  - Use the `customErrorOnTypeFailure` field
4. We can throw custom errors on restriction failures.
  - `Promise.reject` with whatever error you want.


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
