import { NgModule } from '@angular/core';

import { McPseudoCheckbox } from './pseudo-checkbox/pseudo-checkbox';


@NgModule({
    exports: [McPseudoCheckbox],
    declarations: [McPseudoCheckbox]
})
export class McPseudoCheckboxModule {}


export * from './pseudo-checkbox/pseudo-checkbox';
export * from './constants';
