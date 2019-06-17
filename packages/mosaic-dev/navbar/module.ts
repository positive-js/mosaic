import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McIconModule } from '../../mosaic/icon';
import { McNavbarModule, McNavbar } from '../../mosaic/navbar';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
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
        BrowserModule,
        McNavbarModule,
        McIconModule,
        FormsModule
    ],
    bootstrap: [
        NavbarDemoComponent
    ]
})
export class NavbarDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(NavbarDemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));
