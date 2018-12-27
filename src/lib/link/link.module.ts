import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';

import { McLink } from './link.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule
    ],
    declarations: [McLink],
    exports: [McLink]
})
export class McLinkModule {}
