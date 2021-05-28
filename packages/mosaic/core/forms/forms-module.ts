import { NgModule } from '@angular/core';

import {
    McFormElement,
    McFormFieldSet,
    McFormHorizontal,
    McFormRow,
    McFormVertical
} from './forms.directive';


@NgModule({
    exports: [
        McFormHorizontal,
        McFormVertical,
        McFormRow,
        McFormFieldSet,
        McFormElement
    ],
    declarations: [
        McFormHorizontal,
        McFormVertical,
        McFormRow,
        McFormFieldSet,
        McFormElement
    ]
})
export class McFormsModule {}
