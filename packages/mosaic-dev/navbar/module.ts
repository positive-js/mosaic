import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';

import { McIconModule } from '../../mosaic/icon';
import { McNavbarModule, McNavbar } from '../../mosaic/navbar';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarDemoComponent {

    @ViewChild('navbar', {static: false})
    navbar: McNavbar;

    readonly minNavbarWidth: number = 940;

    get collapsedNavbarWidth(): number {
        return this._collapsedNavbarWidth;
    }

    set collapsedNavbarWidth(value: number) {
        if (value < this.minNavbarWidth) {
            return;
        }
        this._collapsedNavbarWidth = value;
    }

    private _collapsedNavbarWidth: number = 1280;

    collapsedNavbarWidthChange() {
        this.navbar.updateCollapsed();
    }

    onItemClick(event: MouseEvent) {
        alert(`innerText: ${(<HTMLElement> event.target).innerText}`);
    }
}


@NgModule({
    declarations: [
        NavbarDemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        McNavbarModule,
        McIconModule,
        McButtonModule,
        FormsModule,
        McDropdownModule
    ],
    bootstrap: [
        NavbarDemoComponent
    ]
})
export class DemoModule {}
