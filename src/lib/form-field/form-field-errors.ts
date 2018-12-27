export function getMcFormFieldMissingControlError(): Error {
  return Error('mc-form-field must contain a McFormFieldControl.');
}
