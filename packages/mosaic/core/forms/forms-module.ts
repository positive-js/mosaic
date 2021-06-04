import { NgModule } from '@angular/core';

import {
    McForm,
    McFormElement
} from './forms.directive';


@NgModule({
    exports: [
        McForm,
        McFormElement
    ],
    declarations: [
        McForm,
        McFormElement
    ]
})
export class McFormsModule {}
