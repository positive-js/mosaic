
/** Interface for a text control that is used to drive interaction with a mc-tag-list. */
// tslint:disable-next-line: naming-convention
export interface McTagTextControl {
  id: string;

  placeholder: string;

  focused: boolean;

  empty: boolean;

  focus(): void;
}
