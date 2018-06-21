import { FormsModule } from '@angular/forms';
import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McNavbarModule, McNavbar } from '../../lib/navbar/';
import { McIconModule } from '../../lib/icon';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarDemoComponent {

    @ViewChild('navbar')
    navbar: McNavbar;

    readonly minNavbarWidth: number = 915;

    private _collapsedNavbarWidth: number = 1280;

    get collapsedNavbarWidth(): number {
        return this._collapsedNavbarWidth;
    }

    set collapsedNavbarWidth(value: number) {
        if (value < this.minNavbarWidth) {
            return;
        }
        this._collapsedNavbarWidth = value;
    }

    collapsedNavbarWidthChange() {
        this.navbar.collapse();
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
    .catch((error) => console.error(error));

