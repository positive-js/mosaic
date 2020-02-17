/** Interface for a text control that is used to drive interaction with a mc-tag-list. */
import { NgControl } from '@angular/forms';


// tslint:disable-next-line: naming-convention
export interface McTagTextControl {
    id: string;

    placeholder: string;

    focused: boolean;

    empty: boolean;

    ngControl?: NgControl;

    focus(): void;
}
