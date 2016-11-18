/// Module for all custom types in the library.


/**
 * Maps the reference names to there schema. (Acc == accumulator)
 */
export interface referenceAcc {
  [referenceName: string]: typeSchema<any, any>
}


/**
 * A `schema` is a thin layer over a Typescript `type`.
 *
 * Every schema should extend `baseSchema` so that it specifies:
 *   - [Optionally] A custom error `any` if the type is invalid (this is not
 *     the same as the restriction failing).
 *   - [Optionally] Specify that null is allowed, by default it is not.
 *   - [Optionally] Specify that undefined is allowed, by default it is not.
 *   - [Optionally] Specify a context to run the function in. This should be
 *                  used exclusively for mutual recursion. Wrapping the
 *                  referenceAcc in a function allows you to reference things
 *                  not yet defined (required for mutual recursion).
 */
export interface baseSchema {
  typeFailureError?: any;
  nullAllowed?: boolean;
  undefinedAllowed?: boolean;
  withContext?: () => referenceAcc;
}


/**
 * A restrictable schema represents a schema which can have restrictions.
 * Currently all kinds of schema types support restrictions except for
 * union schemas (because in a union, each individual schema should have it's
 * own restrictions).
 */
export interface restrictable<CaptureOut, CaptureIn> {
  restriction?: restriction<CaptureOut, CaptureIn>;
}

/**
 * A named schema is a schema that is allowed to give itself a name which can
 * then be used for recursiveness.
 */
export interface nameable {
  name?: string;
}


/**
 * This type is not used in the API, but can be helpful when working with
 * schemas and behaving according to the type of schema.
 *
 * TODO: Do we want a function for getting the typeOfSchema?
 */
export enum kindOfSchema {
  primitive,
  array,
  union,
  object,
  reference
}


/**
 * The 6 Javascript primitive types.
 *
 * NOTE: symbols are dropped completely in `JSON.stringify`, so you definitely
 *       shouldn't be sending those fromt the frontend, and I see very little
 *       use-case for specifically requesting null/undefined, but for
 *       flexibility all javascript primitives are included.
 */
export enum kindOfPrimitive {
  string,
  number,
  boolean,
  null,
  undefined,
  symbol
}


/**
 * A restriction can be placed on any `restrictableType`, for which it should
 * `Promise.reject(any error)` too fail the restriction, otherwise it succeeds.
 *
 */
export type restriction<CaptureOut, CaptureIn> =
  (modelInstance: any, captured?: CaptureIn) => void | Promise<CaptureOut>;


/**
 * A formal representation of the structure of a `type`.
 */
export type typeSchema<CaptureOut, CaptureIn>
  = primitiveSchema<CaptureOut>
  | arraySchema<CaptureOut, any>
  | unionSchema<CaptureOut, CaptureIn>
  | objectSchema<CaptureOut, any>
  | referenceSchema<CaptureOut, CaptureIn>;


/**
 * A reference type references another type defined "above" in the schema.
 *
 * Reference types are special in that they do not parralel to one of
 * typescript's types the way the other types do, but it does parralel over to
 * typescript none-the-less. In typescript you are allowed to reference
 * yourself inside yourself, this is essential. Eg.
 *
 *  interface x {
 *    bla: x
 *  }
 *
 * You can't do this in Javascript objects (the inner x will be undefined at
 * runtime), so we need a mechanism to recreate that nice typescript feature,
 * hence referenceTypes.
 *
 * ReferenceTypes are also unique in that they are not only allowed to reference
 * another type, they are allowed to overwrite any of their properties outside
 * of their actual type (eg. a referenceType can specify `nullAllowed` which
 * will overwrite whatever was specified in the object itself). If you don't
 * want to change any of the additional properties, simply don't specify them.
 */
export interface referenceSchema<CaptureOut, CaptureIn>
  extends
    baseSchema,
    restrictable<CaptureOut, CaptureIn> {

  /**
   * The name of the object we are referencing.
   */
  referenceName: string;
}


/**
* A formal representation of the structure of an object.
*
* NOTE: This maps over to an `interface` from typescript.
*/
export interface objectSchema<CaptureOut, PropertyCaptureOut>
  extends
    baseSchema,
    restrictable<CaptureOut, {[key: string]: PropertyCaptureOut}>,
    nameable {

  /**
   * The properties on the interface.
   */
  objectProperties: {
    /**
     * Each property has a type.
     */
    [propertyName: string]: typeSchema<PropertyCaptureOut, any>;
  };
}


/**
 * A formal representation of the structure of a primitive.
 */
export interface primitiveSchema<CaptureOut>
  extends
    baseSchema,
    restrictable<CaptureOut, undefined> {

  /**
   * Specifiying which `kindOfPrimitive` it is.
   */
  primitiveType: kindOfPrimitive;
}


/**
 * A formal representation of the structure of an array.
 *
 * NOTE: The restriction applies to the array itself, not the elements in
 * the array, the restrictions on the elements themselves will be
 * determined from the restrictions placed on the `arrayElementType`
 * `typeSchema`.
 */
export interface arraySchema<CaptureOut, ElementCaptureOut>
  extends
    baseSchema,
    restrictable<CaptureOut, Array<ElementCaptureOut>>,
    nameable {

  /**
   * The type of a single element in the array.
   */
  arrayElementType: typeSchema<ElementCaptureOut, any>;
}


/**
 * A formal representation of the structure of a union of types.
 *
 * NOTE: A union has no restrictions because the restrcitions will be
 * present on each individual type in the union.
 *
 * NOTE: A union is not nameable because using a union for recursive purposes
 *       can result in infinite expansion. With a union we validate against the
 *       same modelInstance, so the type itself just repeatedly unravels.
 */
export interface unionSchema<CaptureOut, CaptureIn> extends baseSchema {
  /**
   * A union of all the types in `typeSchema`.
   */
  unionTypes: typeSchema<CaptureOut, CaptureIn>[];
}


/**
 * Possible errors thrown by the type being invalid.
 */
export enum schemaTypeError {
  // Should never happen in production, fired if a schema is invalid.
  invalidSchema,
  nullField,
  undefinedField,
  primitiveFieldInvalid,
  arrayFieldInvalid,
  objectFieldInvalid,
  objectHasExtraFields,
  unionHasNoMatchingType,
  referenceNotFound
}
