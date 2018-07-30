import { NgModule } from '@angular/core';

import { PlatformModule } from '../platform';

import { CdkAutofill } from './autofill';


@NgModule({
    declarations: [CdkAutofill],
    imports: [PlatformModule],
    exports: [CdkAutofill]
})
export class TextFieldModule {
}
