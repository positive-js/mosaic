import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McHighlightModule, McHighlightPipe } from '@ptsecurity/mosaic/core';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { SitesMenuComponent } from './sites-menu.component';
import { CommonModule } from '@angular/common';


const MOSAIC_MODULES = [
    McDropdownModule,
    McFormFieldModule,
    McTreeModule,
    McInputModule,
    McIconModule,
    McListModule,
    McHighlightModule
];

@NgModule({
    declarations: [SitesMenuComponent],
    imports: [
        CommonModule,
        FormsModule,
        ...MOSAIC_MODULES
    ],
    exports: [SitesMenuComponent],
    providers: [McHighlightPipe]
})
export class SitesMenuModule {
}
