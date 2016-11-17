# Kleen Changelog

### Kleen V1.1.0 (2016-11-16)

##### Additions

You can now handle recursive/mutually-recursive data. A new kind of schema has
been added, a `referenceSchema`, which allows you to reference other schemas,
this solves recursion. To handle mutual recursion we use references, but then
we also add the ability to add to your context so you can mutually recurse
to another object (`withContext` field on all schemas).

##### Bug Fixes

A bad bug fix with `null == undefined` causes the undefined case to be the same
as the null case, this is a bad bug so you should use above V1.1.0.

No breaking changes.


### Kleen V1.0.2 (2016-11-14)

Updated the README, no longer have the tutorial in the README, moved that to
the website.

No additions or breaking changes.

### Kleen V1.0.1 (2016-11-13)

Updated the tutorial in the README to reflect the new syntax in V1.0.0.

No additions or breaking changes.

### Kleen V1.0.0 (2016-11-13)

##### Upgrading from V0.1.x

Upgrading should be easy, it's just naming changes, the semantics remain the
same.

##### Breaking Changes

- Changed naming
  - Used `schema` instead of `type` in multiple places
  - Changed unique property name on individual schemas
    - `elementType` -> `arrayElementType`
    - `properties` -> `objectProperties`
    - `types` -> `unionTypes`
    - `kindOfPrimitive` -> `primitiveType`

- Dropped the need to specify the `kindOfType` manually, this helps greatly
  reduce boilerplate (reduces sizes of structures by 25-50% without changing
  readability).
