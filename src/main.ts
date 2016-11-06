import {
  kindOfType,
  kindOfPrimitive,
  typeStructure,
  arrayStructure,
  objectStructure,
  unionStructure,
  primitiveStructure,
  restriction,
  typeError
 } from "./types";
import { isNull, isUndefined, anyPromise } from "./util";


/**
 * Export types used in library so that a user can create their own
 * `typeStructures` (and have them be type checked).
 */
export * from "./types";


/**
 * Asserts that a model has a valid structure.
 *
 * A valid structure means:
 *  - No extra properties are present anywhere in the model.
 *  - All neccessary properties are present.
 *  - Every property has the correct type
 *  - All restrictions are met for that property.
 *
 * @param typeStructure A representation of the valid type structure
 * @param modelInstance An instane of the model being validified
 * @returns Promise<void>, if the promise was `resolve`d, the model is valid,
 *          if the promise was `reject`ed, there was an error.
 *
 * NOTE: The function is curried. This allows you to build your validifiers once
 *       and use them all over your code (keep it DRY).
 */
export const validModel = (typeStructure: typeStructure): ((any) => Promise<void>) => {

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
          if(typeStructure.nullAllowed) {
            return resolve();
          }

          return reject(
            typeStructure.customErrorOnTypeFailure ||
            typeError.nullField
          );
        }

        if(isUndefined(modelInstance)) {
          if(typeStructure.undefinedAllowed) {
            return resolve();
          }

          return reject(
            typeStructure.customErrorOnTypeFailure ||
            typeError.undefinedField
          );
        }
      }

      // Handle 4 cases depending on the `kindOfType`.
      switch(typeStructure.kindOfType) {

        case kindOfType.primitive:
          // Cast for better inference.
          const primitiveStructure = typeStructure as primitiveStructure;
          const primitiveTypeStringName =
            kindOfPrimitive[primitiveStructure.kindOfPrimitive];

          if(typeof modelInstance === primitiveTypeStringName) {
            return resolveIfRestrictionMet(primitiveStructure.restriction);
          }

          return reject(
            primitiveStructure.customErrorOnTypeFailure ||
            typeError.primitiveFieldInvalid
          );

        case kindOfType.array:
          // Casting for better inference.
          const arrayStructure = typeStructure as arrayStructure;
          if(!Array.isArray(modelInstance)) {
            return reject(
              arrayStructure.customErrorOnTypeFailure ||
              typeError.arrayFieldInvalid
            );
          } else {
            return Promise.all(
              modelInstance.map((arrayElement: any) => {
                return validModel(arrayStructure.elementType)(arrayElement);
              })
            )
            .then(() => {
              return resolveIfRestrictionMet(arrayStructure.restriction);
            })
            .catch((error) => {
              return reject(error);
            });
          }

        case kindOfType.object:
          // Casting for better inference.
          const objectStructure = typeStructure as objectStructure;

          if(typeof modelInstance != "object") {
            return reject(
              objectStructure.customErrorOnTypeFailure ||
              typeError.objectFieldInvalid
            );
          }

          // Unspecified properties on `modeInstance` not allowed.
          for(let modelProperty in modelInstance) {
            if(!objectStructure.properties[modelProperty]) {
              return reject(
                objectStructure.customErrorOnTypeFailure ||
                typeError.objectHasExtraFields
              );
            }
          }

          return Promise.all(
            Object.keys(objectStructure.properties).map((key: string) => {
              return validModel(objectStructure.properties[key])(modelInstance[key]);
            })
          )
          .then(() => {
            return resolveIfRestrictionMet(objectStructure.restriction);
          })
          .catch((error) => {
            return reject(error);
          });

        case kindOfType.union:
          // Casting for better inference.
          const unionStructure = typeStructure as unionStructure;

          return anyPromise(
            unionStructure.types.map((singleTypeFromUnion: typeStructure) => {
              return validModel(singleTypeFromUnion)(modelInstance);
            })
          )
          .then(() => {
            return resolve();
          })
          .catch((arrayOfRejectedPromisesErrors: any[]) => {
            return reject(
              unionStructure.customErrorOnTypeFailure ||
              typeError.unionHasNoMatchingType
            );
          });
      }
    });
  }
}
