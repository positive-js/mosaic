export function throwMcDropdownMissingError() {
    throw Error(`mcDropdownTriggerFor: must pass in an mc-dropdown instance.
    Example:
      <mc-dropdown #menu="matMenu"></mc-dropdown>
      <button [mcDropdownTriggerFor]="menu"></button>`);
}

/**
 * Throws an exception for the case when dropdown's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 * @docs-private
 */
export function throwMcDropdownInvalidPositionX() {
    throw Error(`xPosition value must be either 'before' or after'.
      Example: <mc-dropdown xPosition="before" #menu="matMenu"></mc-dropdown>`);
}

/**
 * Throws an exception for the case when dropdown's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 * @docs-private
 */
export function throwMcDropdownInvalidPositionY() {
    throw Error(`yPosition value must be either 'above' or below'.
      Example: <mc-dropdown yPosition="above" #menu="matMenu"></mc-dropdown>`);
}
