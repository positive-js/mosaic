/**
 * Returns an exception to be thrown when attempting to change a select's `multiple` option
 * after initialization.
 * @docs-private
 */
export function getMcSelectDynamicMultipleError(): Error {
    return Error('Cannot change `multiple` mode of select after initialization.');
}

/**
 * Returns an exception to be thrown when attempting to assign a non-array value to a select
 * in `multiple` mode. Note that `undefined` and `null` are still valid values to allow for
 * resetting the value.
 * @docs-private
 */
export function getMcSelectNonArrayValueError(): Error {
    return Error('Value must be an array in multiple-selection mode.');
}

/**
 * Returns an exception to be thrown when assigning a non-function value to the comparator
 * used to determine if a value corresponds to an option. Note that whether the function
 * actually takes two values and returns a boolean is not checked.
 */
export function getMcSelectNonFunctionValueError(): Error {
    return Error('`compareWith` must be a function.');
}
