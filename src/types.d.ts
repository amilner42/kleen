export interface referenceAcc {
    [referenceName: string]: typeSchema;
}
export interface baseSchema {
    typeFailureError?: any;
    nullAllowed?: boolean;
    undefinedAllowed?: boolean;
    withContext?: () => referenceAcc;
}
export interface restrictable {
    restriction?: restriction;
}
export interface nameable {
    name?: string;
}
export declare enum kindOfSchema {
    primitive = 0,
    array = 1,
    union = 2,
    object = 3,
    reference = 4,
    map = 5,
}
export declare enum kindOfPrimitive {
    string = 0,
    number = 1,
    boolean = 2,
    null = 3,
    undefined = 4,
    symbol = 5,
}
export declare type restriction = (modelInstance: any) => void | Promise<void>;
export declare type typeSchema = primitiveSchema | arraySchema | unionSchema | objectSchema | referenceSchema | mapSchema;
export interface referenceSchema extends baseSchema, restrictable {
    referenceName: string;
}
export interface objectSchema extends baseSchema, restrictable, nameable {
    objectProperties: {
        [propertyName: string]: typeSchema;
    };
}
export interface primitiveSchema extends baseSchema, restrictable {
    primitiveType: kindOfPrimitive;
}
export interface arraySchema extends baseSchema, restrictable, nameable {
    arrayElementType: typeSchema;
}
export interface unionSchema extends baseSchema {
    unionTypes: typeSchema[];
}
export interface mapSchema extends baseSchema, restrictable, nameable {
    mapValueType: typeSchema;
}
export declare enum schemaTypeError {
    invalidSchema = 0,
    nullField = 1,
    undefinedField = 2,
    primitiveFieldInvalid = 3,
    arrayFieldInvalid = 4,
    objectFieldInvalid = 5,
    mapFieldInvalid = 6,
    objectHasExtraFields = 7,
    unionHasNoMatchingType = 8,
    referenceNotFound = 9,
}
