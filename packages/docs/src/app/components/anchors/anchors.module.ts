import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AnchorsComponent } from './anchors.component';


@NgModule({
    imports: [CommonModule, RouterModule],
    exports: [AnchorsComponent],
    declarations: [AnchorsComponent]
})
export class AnchorsModule {}
