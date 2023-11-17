import Ajv, { ErrorObject, ValidateFunction } from "ajv";

export interface JSONValidationResult {
    valid: boolean,
    errorMessage?: string
};

export const validate = (data: object, schema: object): JSONValidationResult => {
    const ajv = new Ajv();

    const validate: ValidateFunction = ajv.compile<object>(schema);

    const valid: boolean = validate(data);

    const errorMessage: string = getErrorMessage(validate.errors);

    return { valid, errorMessage };
}

const getErrorMessage = (errors: ErrorObject[]): string | undefined => {
    return errors?.length ? `${errors[0].instancePath}: ${errors[0].message}` : undefined;
}
