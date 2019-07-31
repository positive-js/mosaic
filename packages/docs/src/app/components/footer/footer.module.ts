import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FooterComponent } from './footer.component';


@NgModule({
    imports: [CommonModule],
    exports: [FooterComponent],
    declarations: [FooterComponent]
})
export class FooterModule {}
