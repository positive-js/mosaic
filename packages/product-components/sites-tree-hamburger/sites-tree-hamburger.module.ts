import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McHighlightModule, McHighlightPipe } from '@ptsecurity/mosaic/core';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { SitesTreeHamburgerComponent } from './sites-tree-hamburger.component';


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
    declarations: [SitesTreeHamburgerComponent],
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        ...MOSAIC_MODULES
    ],
    exports: [SitesTreeHamburgerComponent],
    providers: [McHighlightPipe]
})
export class SitesTreeHamburgerModule {
}
