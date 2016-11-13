/// Module for all custom types in the library.


/**
 * A `schema` is a thin layer over a Typescript `type`.
 *
 * Every schema should extend `baseSchema` so that it specifies:
 *   - [Optionally] A custom error `any` if the type is invalid (this is not
 *     the same as the restriction failing).
 *   - [Optionally] Specify that null is allowed, by default it is not.
 *   - [Optionally] Specify that undefined is allowed, by default it is not.
 */
export interface baseSchema {
  typeFailureError?: any;
  nullAllowed?: boolean;
  undefinedAllowed?: boolean;
}


/**
 * A restrictable schema represents a schema which can have restrictions.
 * Currently all kinds of schema types support restrictions except for
 * union schemas (because in a union, each individual schema should have it's
 * own restrictions).
 */
export interface restrictableSchema extends baseSchema {
  restriction?: restriction;
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
  object
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
 */
export type restriction = (modelInstance: any) => void | Promise<void>;


/**
 * A formal representation of the structure of a `type`.
 */
export type typeSchema
  = primitiveSchema
  | arraySchema
  | unionSchema
  | objectSchema;


/**
* A formal representation of the structure of an object.
*
* NOTE: This maps over to an `interface` from typescript.
*/
export interface objectSchema extends restrictableSchema {
  /**
   * The properties on the interface.
   */
  properties: {
    /**
     * Each property has a type.
     */
    [propertyName: string]: typeSchema;
  };
}


/**
 * A formal representation of the structure of a primitive.
 */
export interface primitiveSchema extends restrictableSchema {
  /**
   * Specifiying which `kindOfPrimitive` it is.
   */
  kindOfPrimitive: kindOfPrimitive;
}


/**
 * A formal representation of the structure of an array.
 *
 * NOTE: The restriction applies to the array itself, not the elements in
 * the array, the restrictions on the elements themselves will be
 * determined from the restrictions placed on the `elementType`
 * `typeSchema`.
 */
export interface arraySchema extends restrictableSchema {
  /**
   * The type of a single element in the array.
   */
  elementType: typeSchema;
}


/**
 * A formal representation of the structure of a union of types.
 *
 * NOTE: A union has no restrictions because the restrcitions will be
 * present on each individual type in the union.
 */
export interface unionSchema extends baseSchema {
  /**
   * A union of all the types in `types`.
   */
  types: typeSchema[];
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
  unionHasNoMatchingType
}
