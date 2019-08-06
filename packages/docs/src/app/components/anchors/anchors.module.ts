import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnchorsComponent } from './anchors.component';


@NgModule({
    imports: [CommonModule],
    exports: [AnchorsComponent],
    declarations: [AnchorsComponent]
})
export class AnchorsModule {}
