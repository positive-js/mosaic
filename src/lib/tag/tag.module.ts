import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PlatformModule } from '@ptsecurity/cdk/platform';

import { McTag } from './tag.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule
    ],
    exports: [
        McTag
    ],
    declarations: [
        McTag
    ]
})
export class McTagModule {}
