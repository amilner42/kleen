import {
  kindOfSchema,
  kindOfPrimitive,
  typeSchema,
  arraySchema,
  objectSchema,
  unionSchema,
  primitiveSchema,
  restriction,
  schemaTypeError
 } from "./types";
import { isNull, isUndefined, anyPromise } from "./util";


/**
 * Export types used in library so that a user can create their own
 * `typeSchema`s (and have them be type checked).
 */
export * from "./types";


/**
 * Asserts that a model is valid according to a schema.
 *
 * A valid model means:
 *  - No extra properties are present anywhere in the model.
 *  - All neccessary properties are present.
 *  - Every property has the correct type
 *  - All restrictions are met for that property.
 *
 * @param typeSchema A representation of a valid model.
 * @param modelInstance An instane of the model being validified
 * @returns Promise<void>, if the promise was `resolve`d, the model is valid,
 *          if the promise was `reject`ed, there was an error.
 *
 * NOTE: The function is curried. This allows you to build your validifiers once
 *       and use them all over your code (keep it DRY).
 */
export const validModel = (typeSchema: typeSchema): ((any) => Promise<void>) => {

  return (modelInstance: any): Promise<void> => {

    /**
     * If a restriction exists, checks it.
     *
     * Wraps everything in a promise to change the return type of the restriction
     * from `void | Promis<void>`  to `Promise<void>`.
     */
    const modelInstanceFollowsRestriction =
        (restriction: restriction): Promise<void> => {
      // If no restriction then the model follows the restriction.
      if(!restriction) {
        return Promise.resolve();
      }

      // Let `.then` convert our `void | Promise<void>` to `Promise<void>`.
      return Promise.resolve()
      .then(() => {
        return restriction(modelInstance);
      });
    }

    // Validaton performed inside.
    return new Promise<void>((resolve, reject) => {

      // Helper for staying DRY.
      const resolveIfRestrictionMet = (restriction: restriction): Promise<void> => {
        return modelInstanceFollowsRestriction(restriction)
        .then(() => {
          return resolve();
        })
        .catch((error) => {
          return reject(error);
        })
      }

      // Check for null/undefined, this doesn't depend on the `kindOfType`.
      {
        if(isNull(modelInstance)) {
          if(typeSchema.nullAllowed) {
            return resolve();
          }

          return reject(
            typeSchema.typeFailureError ||
            schemaTypeError.nullField
          );
        }

        if(isUndefined(modelInstance)) {
          if(typeSchema.undefinedAllowed) {
            return resolve();
          }

          return reject(
            typeSchema.typeFailureError ||
            schemaTypeError.undefinedField
          );
        }
      }

      // Figure out type of object. If the type is invalid, reject with a
      // `invalid schema` error, if you use typescript then these errors will
      // never occur.
      const isObject = !isUndefined((typeSchema as objectSchema).objectProperties);
      const isArray = !isUndefined((typeSchema as arraySchema).arrayElementType);
      const isPrimitive = !isUndefined((typeSchema as primitiveSchema).primitiveType);
      const isUnion = !isUndefined((typeSchema as unionSchema).unionTypes);

      // To avoid boilerplate, we don't force the user to specify the
      // `kindOfTypeSchema` and instead manually resolve it at runtime.
      const kindOfTypeSchema =
        (isObject && !isArray && !isPrimitive && !isUnion)
          ?
            kindOfSchema.object
          :
            (!isObject && isArray && !isPrimitive && !isUnion)
              ?
                kindOfSchema.array
              :
                (!isObject && !isArray && isPrimitive && !isUnion)
                  ?
                    kindOfSchema.primitive
                  :
                    (!isObject && !isArray && !isPrimitive && isUnion)
                      ?
                        kindOfSchema.union
                      :
                          undefined;

      // If it's not a valid schema, we throw an `invalidSchema` error.
      if(isUndefined(kindOfTypeSchema)) {
        return Promise.reject(schemaTypeError.invalidSchema);
      };

      // Handle 4 cases depending on the `kindOfSchema`.
      switch(kindOfTypeSchema) {

        case kindOfSchema.primitive:
          // Cast for better inference.
          const primitiveStructure = typeSchema as primitiveSchema;
          const primitiveTypeStringName =
            kindOfPrimitive[primitiveStructure.primitiveType];

          if(typeof modelInstance === primitiveTypeStringName) {
            return resolveIfRestrictionMet(primitiveStructure.restriction);
          }

          return reject(
            primitiveStructure.typeFailureError ||
            schemaTypeError.primitiveFieldInvalid
          );

        case kindOfSchema.array:
          // Casting for better inference.
          const arrayStructure = typeSchema as arraySchema;
          if(!Array.isArray(modelInstance)) {
            return reject(
              arrayStructure.typeFailureError ||
              schemaTypeError.arrayFieldInvalid
            );
          } else {
            return Promise.all(
              modelInstance.map((arrayElement: any) => {
                return validModel(arrayStructure.arrayElementType)(arrayElement);
              })
            )
            .then(() => {
              return resolveIfRestrictionMet(arrayStructure.restriction);
            })
            .catch((error) => {
              return reject(error);
            });
          }

        case kindOfSchema.object:
          // Casting for better inference.
          const objectStructure = typeSchema as objectSchema;

          if(typeof modelInstance != "object") {
            return reject(
              objectStructure.typeFailureError ||
              schemaTypeError.objectFieldInvalid
            );
          }

          // Unspecified properties on `modeInstance` not allowed.
          for(let modelProperty in modelInstance) {
            if(!objectStructure.objectProperties[modelProperty]) {
              return reject(
                objectStructure.typeFailureError ||
                schemaTypeError.objectHasExtraFields
              );
            }
          }

          return Promise.all(
            Object.keys(objectStructure.objectProperties).map((key: string) => {
              return validModel(objectStructure.objectProperties[key])(modelInstance[key]);
            })
          )
          .then(() => {
            return resolveIfRestrictionMet(objectStructure.restriction);
          })
          .catch((error) => {
            return reject(error);
          });

        case kindOfSchema.union:
          // Casting for better inference.
          const unionStructure = typeSchema as unionSchema;

          return anyPromise(
            unionStructure.unionTypes.map((singleTypeFromUnion: typeSchema) => {
              return validModel(singleTypeFromUnion)(modelInstance);
            })
          )
          .then(() => {
            return resolve();
          })
          .catch((arrayOfRejectedPromisesErrors: any[]) => {
            return reject(
              unionStructure.typeFailureError ||
              schemaTypeError.unionHasNoMatchingType
            );
          });
      }
    });
  }
}
