import {
  kindOfSchema,
  kindOfPrimitive,
  typeSchema,
  arraySchema,
  objectSchema,
  mapSchema,
  unionSchema,
  referenceSchema,
  primitiveSchema,
  anySchema,
  restriction,
  schemaTypeError,
  referenceAcc
 } from "./types";
import { isNull, isUndefined, anyPromise } from "./util";


/**
 * Creates a new refrence accumulator if the typeSchema is named with the new
 * schema. References with the same name will overwrite previous references.
 *
 * NOTE: While this creates a new object, it only does a shallow copy so all
 *       references still point to the same typeSchemas.
 */
const createNewReferenceAccumulator = (currentReferenceAccumulator: referenceAcc
    , typeSchema: typeSchema): referenceAcc => {

  if(!typeSchema["name"]) {
    return currentReferenceAccumulator;
  }

  // Shallow copy and add new reference.
  const newReferenceAccumulator = Object.assign(
    {}, currentReferenceAccumulator, { [typeSchema["name"]]: typeSchema }
  );

  return newReferenceAccumulator;
}


/**
 * A reference is allowed to overwrite properties in the object that it is
 * referencing, that logic is implemented here.
 */
const mergeSchemas = (referencingSchema: typeSchema, referenceSchema: referenceSchema): typeSchema => {
  // These properties can be over-written.
  const overWriteableProperties = [
    "nullAllowed",
    "undefinedAllowed",
    "typeFailureError",
    "restriction",
    "withContext"
  ];

  // Shallow clone.
  let newSchema = Object.assign({}, referencingSchema);

  // Overwrite overwritable properties of newSchema.
  overWriteableProperties.map((propertyName: string) => {
    if(referenceSchema[propertyName] !== undefined) {
      newSchema[propertyName] = referenceSchema[propertyName];
    }
  });

  return newSchema;
};

/**
 * Figures out which type `typeSchema` is by checking which of the unique
 * properties it has (eg. `arrayElementType`), if it does not have exactly one
 * unique property, null is returned.
 */
const getTypeOfSchema = (typeSchema: typeSchema) => {

  const isObject = !isUndefined((typeSchema as objectSchema).objectProperties);
  const isArray = !isUndefined((typeSchema as arraySchema).arrayElementType);
  const isPrimitive = !isUndefined((typeSchema as primitiveSchema).primitiveType);
  const isUnion = !isUndefined((typeSchema as unionSchema).unionTypes);
  const isReference = !isUndefined((typeSchema as referenceSchema).referenceName);
  const isMap = !isUndefined((typeSchema as mapSchema).mapValueType);
  const isAny = (typeSchema as anySchema).isAny;

  const kindOfTypeSchema =
    (isObject && !isArray && !isPrimitive && !isUnion && !isReference && !isMap && !isAny)
      ?
        kindOfSchema.object
      :
        (!isObject && isArray && !isPrimitive && !isUnion && !isReference && !isMap && !isAny)
          ?
            kindOfSchema.array
          :
            (!isObject && !isArray && isPrimitive && !isUnion && !isReference && !isMap && !isAny)
              ?
                kindOfSchema.primitive
              :
                (!isObject && !isArray && !isPrimitive && isUnion && !isReference && !isMap && !isAny)
                  ?
                    kindOfSchema.union
                  :
                    (!isObject && !isArray && !isPrimitive && !isUnion && isReference && !isMap && !isAny)
                    ?
                      kindOfSchema.reference
                    :
                      (!isObject && !isArray && !isPrimitive && !isUnion && !isReference && isMap && !isAny)
                      ?
                        kindOfSchema.map
                      :
                        (!isObject && !isArray && !isPrimitive && !isUnion && !isReference && !isMap && isAny)
                        ?
                          kindOfSchema.any
                        :
                          null;

  return kindOfTypeSchema;
}


/**
 * Valid model internal allows us to pass parameters in the recursion that we
 * don't want to show the user. For now we use the following accumulators:
 *
 * `references`: An object where the keys are names and the values are
 *              typeSchemas. This is how we handle references internally,
 *              adding them as we go through an object.
 */
const validModelInternal = (typeSchema: typeSchema
    , references: referenceAcc): ((any) => Promise<void>) => {

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

      // To avoid boilerplate, we don't force the user to specify the
      // `kindOfTypeSchema` and instead manually resolve it at runtime.
      const kindOfTypeSchema = getTypeOfSchema(typeSchema);

      // If it's not a kind of type then we throw an `invalidSchema` error.
      if(isNull(kindOfTypeSchema)) {
        return reject(schemaTypeError.invalidSchema);
      };

      // Check for null/undefined, this doesn't depend on the `kindOfType`
      // unless it is a reference, in which case we don't do the check because
      // the reference still needs to be unravelled.
      {
        if(kindOfTypeSchema !== kindOfSchema.reference) {
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
      }

      // If a `withContext` exists, we need to update our references. As per
      // usual we make a shallow copy to avoid messing with any other objects
      // pointing at the same reference.
      if(typeSchema.withContext) {
        references = Object.assign({}, references, typeSchema.withContext());
      }

      // Handle 6 cases depending on the `kindOfSchema`.
      switch(kindOfTypeSchema) {

        case kindOfSchema.primitive: {
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
        }

        case kindOfSchema.array: {
          // Casting for better inference.
          const arrayStructure = typeSchema as arraySchema;
          if(!Array.isArray(modelInstance)) {
            return reject(
              arrayStructure.typeFailureError ||
              schemaTypeError.arrayFieldInvalid
            );
          } else {
            const newReferences =
              createNewReferenceAccumulator(references, arrayStructure);

            const validArrayElement =
              validModelInternal(arrayStructure.arrayElementType, newReferences);

            return Promise.all(
              modelInstance.map((arrayElement: any) => {
                return validArrayElement(arrayElement);
              })
            )
            .then(() => {
              return resolveIfRestrictionMet(arrayStructure.restriction);
            })
            .catch((error) => {
              return reject(error);
            });
          }
        }

        case kindOfSchema.object: {
          // Casting for better inference.
          const objectStructure = typeSchema as objectSchema;

          if(typeof modelInstance !== "object") {
            return reject(
              objectStructure.typeFailureError ||
              schemaTypeError.objectFieldInvalid
            );
          }

          if(Array.isArray(modelInstance)) {
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

          const newReferences =
            createNewReferenceAccumulator(references, objectStructure);

          return Promise.all(
            Object.keys(objectStructure.objectProperties).map((key: string) => {

              const validProperty =
                validModelInternal(objectStructure.objectProperties[key]
                  , newReferences);

              return validProperty(modelInstance[key]);
            })
          )
          .then(() => {
            return resolveIfRestrictionMet(objectStructure.restriction);
          })
          .catch((error) => {
            return reject(error);
          });
        }

        case kindOfSchema.map: {
          // Casting for better inference.
          const mapStructure = typeSchema as mapSchema;

          if(typeof modelInstance !== "object") {
            return reject(
              mapStructure.typeFailureError ||
              schemaTypeError.mapFieldInvalid
            );
          }

          if(Array.isArray(modelInstance)) {
            return reject(
              mapStructure.typeFailureError ||
              schemaTypeError.mapFieldInvalid
            );
          }

          const newReferences =
            createNewReferenceAccumulator(references, mapStructure);

          const validProperty =
            validModelInternal(mapStructure.mapValueType, newReferences);

          return Promise.all(
            Object.keys(modelInstance).map((key: string) => {
              return validProperty(modelInstance[key]);
            })
          )
          .then(() => {
            return resolveIfRestrictionMet(mapStructure.restriction);
          })
          .catch((error) => {
            return reject(error);
          });
        }

        case kindOfSchema.union: {
          // Casting for better inference.
          const unionStructure = typeSchema as unionSchema;

          return anyPromise(
            unionStructure.unionTypes.map((singleTypeFromUnion: typeSchema) => {

              const validUnionType =
                validModelInternal(singleTypeFromUnion, references);

              return validUnionType(modelInstance);
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

        case kindOfSchema.reference: {
          // Casting for better inference.
          const referenceStructure = typeSchema as referenceSchema;
          const referencingStructure = references[referenceStructure.referenceName];

          // If the reference is not in accumulator, throw error. Should only
          // happen to people in development (assuming they have tests).
          if(!referencingStructure) {
            return reject(
              schemaTypeError.referenceNotFound
            );
          }

          // We need to dereferences the refrence and then overwrite the
          // additional fields if specified.
          const referenceActualTypeSchema =
            mergeSchemas(referencingStructure, referenceStructure);

          return resolve(
            validModelInternal(referenceActualTypeSchema, references)(modelInstance)
          );
        }

        case kindOfSchema.any: {
          // Cast for better inference.
          const anyStructure = typeSchema as anySchema;
          return resolveIfRestrictionMet(anyStructure.restriction);
        }
            
      }
    });
  }
}


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
  return validModelInternal(typeSchema, {});
}
