import { typeSchema } from "./types";
export * from "./types";
export declare const validModel: (typeSchema: typeSchema) => (any: any) => Promise<void>;
