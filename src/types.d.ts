export interface baseType {
    kindOfType: kindOfType;
    customErrorOnTypeFailure?: any;
    nullAllowed?: boolean;
    undefinedAllowed?: boolean;
}
export interface restrictableType extends baseType {
    restriction?: restriction;
}
export declare enum kindOfType {
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
export declare type typeStructure = primitiveStructure | arrayStructure | unionStructure | objectStructure;
export interface objectStructure extends restrictableType {
    properties: {
        [propertyName: string]: typeStructure;
    };
}
export interface primitiveStructure extends restrictableType {
    kindOfPrimitive: kindOfPrimitive;
}
export interface arrayStructure extends restrictableType {
    elementType: typeStructure;
}
export interface unionStructure extends baseType {
    types: typeStructure[];
}
export declare enum typeError {
    nullField = 0,
    undefinedField = 1,
    primitiveFieldInvalid = 2,
    arrayFieldInvalid = 3,
    objectFieldInvalid = 4,
    objectHasExtraFields = 5,
    unionHasNoMatchingType = 6,
}
