export function getMcInputUnsupportedTypeError(inputType: string): Error {
    return Error(`Input type "${inputType}" isn't supported by mcInput.`);
}
