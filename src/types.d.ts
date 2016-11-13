export interface baseSchema {
    typeFailureError?: any;
    nullAllowed?: boolean;
    undefinedAllowed?: boolean;
}
export interface restrictableSchema extends baseSchema {
    restriction?: restriction;
}
export declare enum kindOfSchema {
    primitive = 0,
    array = 1,
    union = 2,
    object = 3,
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
export declare type typeSchema = primitiveSchema | arraySchema | unionSchema | objectSchema;
export interface objectSchema extends restrictableSchema {
    properties: {
        [propertyName: string]: typeSchema;
    };
}
export interface primitiveSchema extends restrictableSchema {
    kindOfPrimitive: kindOfPrimitive;
}
export interface arraySchema extends restrictableSchema {
    elementType: typeSchema;
}
export interface unionSchema extends baseSchema {
    types: typeSchema[];
}
export declare enum schemaTypeError {
    invalidSchema = 0,
    nullField = 1,
    undefinedField = 2,
    primitiveFieldInvalid = 3,
    arrayFieldInvalid = 4,
    objectFieldInvalid = 5,
    objectHasExtraFields = 6,
    unionHasNoMatchingType = 7,
}
