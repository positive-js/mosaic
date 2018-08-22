import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McDivider } from './divider.component';


@NgModule({
    imports: [CommonModule],
    exports: [McDivider],
    declarations: [McDivider]
})
export class McDividerModule {
}
