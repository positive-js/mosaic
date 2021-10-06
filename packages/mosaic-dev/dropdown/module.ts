import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    pools = [
        {
            id: 1,
            name: 'x',
            domains: [
                { id: 10, name: 'ax' },
                { id: 11, name: 'bx' }
            ]
        },
        {
            id: 2,
            name: 'y',
            domains: [
                { id: 20, name: 'ay' },
                { id: 21, name: 'by' }
            ]
        },
        {
            id: 3,
            name: 'z',
            domains: [
                { id: 30, name: 'az' },
                { id: 31, name: 'bz' }
            ]
        }
    ];

    someValue = 'Lazy Value';

    isDropdownOpen: boolean = false;

    dropdownOpened() {
        this.isDropdownOpen = true;
    }

    dropdownClosed() {
        this.isDropdownOpen = false;
    }

    selectDomain(id: string): void {
        console.log('selected domain id', id);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McLinkModule,
        McIconModule,
        McButtonModule,
        McDropdownModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
