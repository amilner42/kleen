/// Module for all custom types in the library.


/**
 * Every type should extend `baseType` so that it specifies what category
 * it is in, this makes programmtically sifting through types simpler.
 * Additionally, custom error messages on type failures can be useful, so
 * you are optionally allowed to add an `errorMessageOnTypeFailure` specifying
 * the message to error with on type failure.
 */
interface baseType {
  kindOfType: kindOfType;
  errorMessageOnTypeFailure?: string;
}


/**
 * A restrictable type represents a type which can have restrictions.
 * Currently all categories of types support restrictions except for
 * unions (because in a union, each type should have it's own
 * restrictions).
 */
interface restrictableType extends baseType {
  restriction?: restriction;
}


/**
 * A `typeStructure` is one of the following four categories.
 */
export enum kindOfType {
  primitive,
  array,
  union,
  interface
}


/**
 * The 6 Javascript primitive types.
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
