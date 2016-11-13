# Kleen Changelog

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
