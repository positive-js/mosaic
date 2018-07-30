export function getMcInputUnsupportedTypeError(type: string): Error {
    return Error(`Input type "${type}" isn't supported by mcInput.`);
}
