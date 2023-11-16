import { JSONValidationResult, validate } from "../../../src/lib/jsonValidator";

describe('Test JSON Validator', () => {
    const schema: object = {
        "type": "object",
        "properties": {
            "requiredField": {
                "type": "string"
            },
            "notRequiredField": {
                "type": "string"
            }
        },
        "required": [
            "requiredField"
        ],
        "additionalProperties": false
    };

    it('Should return validation error for missing required field', () => {
        const data: object = {};

        const result: JSONValidationResult = validate(data, schema);

        expect(result.valid).toBeFalsy();
        expect(result.errorMessage).toEqual("must have required property 'requiredField'");
    });

    it('Should return no validation error', () => {
        const data: object = { requiredField: "xxx" };

        const result: JSONValidationResult = validate(data, schema);

        expect(result.valid).toBeTruthy();
        expect(result.errorMessage).toBeUndefined();
    });
});
