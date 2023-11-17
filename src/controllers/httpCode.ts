export const HTTP_CODE_OK = 200;
export const HTTP_CODE_BAD_REQUEST = 400;
export const HTTP_CODE_NOT_FOUND = 404;
export const HTTP_CODE_INTERNAL_SERVER_ERROR = 500;

export type HttpCode =
    typeof HTTP_CODE_OK
    | typeof HTTP_CODE_BAD_REQUEST
    | typeof HTTP_CODE_NOT_FOUND
    | typeof HTTP_CODE_INTERNAL_SERVER_ERROR;
