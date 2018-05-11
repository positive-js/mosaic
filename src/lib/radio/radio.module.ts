import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {A11yModule} from '@ptsecurity/cdk/a11y';
import {McCommonModule} from '@ptsecurity/mosaic/core';

import {McRadioButton, McRadioGroup} from './radio.component';


@NgModule({
    imports: [ CommonModule, A11yModule, McCommonModule ],
    exports: [ McRadioGroup, McRadioButton, McCommonModule ],
    declarations: [ McRadioGroup, McRadioButton ]
})
export class McRadioModule {}
