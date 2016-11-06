/// Module for all custom types in the library.


/**
 * Every type should extend `baseType` so that it specifies:
 *   - What kind of type it is (array or object etc...)
 *   - [Optionally] A custom error `any` if the type is invalid (this is not
 *     the same as the restriction failing).
 *   - [Optionally] Specify that null is allowed, by default it is not.
 *   - [Optionally] Specify that undefined is allowed, by default it is not.
 */
export interface baseType {
  kindOfType: kindOfType;
  customErrorOnTypeFailure?: any;
  nullAllowed?: boolean;
  undefinedAllowed?: boolean;
}


/**
 * A restrictable type represents a type which can have restrictions.
 * Currently all categories of types support restrictions except for
 * unions (because in a union, each type should have it's own
 * restrictions).
 */
export interface restrictableType extends baseType {
  restriction?: restriction;
}


/**
 * A `typeStructure` is one of the following four categories.
 */
export enum kindOfType {
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
 * `Promise.reject(new invalidModelError)` if the `modelInstance` is invalid,
 * otherwise it should `Promise.resolve()`` or simply return void.
 *
 * WARNING: There seems to be slightly strange behaviour when using throwing
 * errors instead of `reject`ing them, so avoid directly throwing errors.
 */
export type restriction = (modelInstance: any) => void | Promise<void>;


/**
 * A formal representation of the structure of a `type`. A `typeStructure` can
 * currently be on of 4 `kindOfType`s.
 */
export type typeStructure
  = primitiveStructure
  | arrayStructure
  | unionStructure
  | objectStructure;


/**
* A formal representation of the structure of an object.
*
* NOTE: This maps over to an `interface` from typescript.
*/
export interface objectStructure extends restrictableType {
  /**
   * The properties on the interface.
   */
  properties: {
    /**
     * Each property has a type.
     */
    [propertyName: string]: typeStructure;
  };
}


/**
 * A formal representation of the structure of a primitive.
 */
export interface primitiveStructure extends restrictableType {
  /**
   * Specifiying which `kindOfPrimitive` it is.
   */
  kindOfPrimitive: kindOfPrimitive;
}


/**
 * A formal representation of the structure of an array.
 *
 * NOTE: The restrictions apply to the array itself, not the elements in
 * the array, the restrictions on the elements themselves will be
 * determined from the restrictions placed on the `elementType`
 * `typeStructure`.
 */
export interface arrayStructure extends restrictableType {
  /**
   * The type of a single element in the array.
   */
  elementType: typeStructure;
}


/**
 * A formal representation of the structure of a union of types.
 *
 * NOTE: A union has no restrictions because the restrcitions will be
 * present on each individual type in the union.
 */
export interface unionStructure extends baseType {
  /**
   * A union of all the types in `types`.
   */
  types: typeStructure[];
}


/**
 * Possible errors thrown by the type being invalid.
 */
export enum typeError {
  nullField,
  undefinedField,
  primitiveFieldInvalid,
  arrayFieldInvalid,
  objectFieldInvalid,
  objectHasExtraFields,
  unionHasNoMatchingType
}
