import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';
import { McVerticalNavbarModule } from '../../lib/vertical-navbar/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalNavbarDemoComponent {
    onItemClick(event: MouseEvent) {
        alert(`innerText: ${(<HTMLElement> event.target).innerText}`);
    }
}


@NgModule({
    declarations: [
        VerticalNavbarDemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McVerticalNavbarModule,
        McButtonModule,
        McIconModule,
        FormsModule
    ],
    bootstrap: [
        VerticalNavbarDemoComponent
    ]
})
export class NavbarDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(NavbarDemoModule)
    .catch((error) => console.error(error));

