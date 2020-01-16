export function getMcFormFieldMissingControlError(): Error {
  return Error('mc-form-field must contain a McFormFieldControl.');
}

export function getMcFormFieldYouCanNotUseCleanerInNumberInputError(): Error {
  return Error(`You can't use mc-cleaner with input that have type="number"`);
}
