import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';
import { McNavbarModule, McNavbar, IMcNavbarDropdownItem } from '../../lib/navbar/';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarDemoComponent {

    @ViewChild('navbar')
    navbar: McNavbar;

    readonly minNavbarWidth: number = 940;

    dropdownItems: IMcNavbarDropdownItem[] = [
        { link: '#1', text: 'Очень длинный список для проверки ширины' },
        { link: '#2', text: 'Общие сведения' },
        { link: '#3', text: 'Еще один пункт' }
    ];

    buttonDropdownItems: IMcNavbarDropdownItem[] = [
        { text: 'Пример кастомного компонента 1' },
        { text: 'Пример кастомного компонента 2' },
        { text: 'Пример кастомного компонента 3' }
    ];

    rightDropdownItems: IMcNavbarDropdownItem[] = [
        { link: '#4', text: 'Пункт в правой части navbar 1' },
        { link: '#5', text: 'Пункт в правой части navbar 2' }
    ];

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
        McButtonModule,
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

