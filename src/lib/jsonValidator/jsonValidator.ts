import Ajv, { ValidateFunction } from "ajv";

export interface JSONValidationResult {
    valid: boolean,
    errorMessage?: string
};

export const validate = (data: object, schema: object): JSONValidationResult => {
    const ajv = new Ajv();

    const validate: ValidateFunction = ajv.compile<object>(schema);

    const valid: boolean = validate(data);
    const errorMessage: string = (validate.errors?.length ?? 0) > 0 ? validate.errors.shift().message : undefined;

    return { valid, errorMessage };
}
