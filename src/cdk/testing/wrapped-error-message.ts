export function wrappedErrorMessage(e: Error) {
    const escapedMessage = e.message.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

    return new RegExp(escapedMessage);
}
