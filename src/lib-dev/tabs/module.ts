import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule, FormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Observable, Observer } from 'rxjs';

import { McCheckboxModule } from '../../lib/checkbox';
import { McFormFieldModule } from '../../lib/form-field';
import { McIconModule } from '../../lib/icon';
import { McInputModule } from '../../lib/input/';
import { McRadioModule } from '../../lib/radio';
import { McTabsModule } from '../../lib/tabs/';


export interface ExampleTab {
    label: string;
    content: string;
}

@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TabsDemoComponent {
    asyncTabs: Observable<ExampleTab[]>;

    tabs = ['First', 'Second', 'Third'];
    selected = new FormControl(0);

    tabLoadTimes: Date[] = [];

    links = ['First', 'Second', 'Third'];
    activeLink = this.links[0];
    background = '';

    constructor() {
        this.asyncTabs = Observable.create((observer: Observer<ExampleTab[]>) => {
            setTimeout(() => {
                observer.next([
                    { label: 'First', content: 'Content 1' },
                    { label: 'Second', content: 'Content 2' },
                    { label: 'Third', content: 'Content 3' }
                ]);
            }, 1000);
        });
    }

    onSelectionChanged(e) {
        console.log(e);
    }

    addTab(selectAfterAdding: boolean) {
        this.tabs.push('New');

        if (selectAfterAdding) {
            this.selected.setValue(this.tabs.length - 1);
        }
    }

    removeTab(index: number) {
        this.tabs.splice(index, 1);
    }

    getTimeLoaded(index: number) {
        if (!this.tabLoadTimes[index]) {
            this.tabLoadTimes[index] = new Date();
        }

        return this.tabLoadTimes[index];
    }

    toggleBackground() {
        this.background = this.background ? '' : 'primary';
    }
}


@NgModule({
    declarations: [
        TabsDemoComponent
    ],
    imports: [
        BrowserModule,
        McFormFieldModule,
        McIconModule,
        McCheckboxModule,
        McRadioModule,
        McTabsModule,
        McInputModule,
        FormsModule
    ],
    bootstrap: [
        TabsDemoComponent
    ]
})
export class TabsDemoModule { }

platformBrowserDynamic()
    .bootstrapModule(TabsDemoModule)
    .catch((error) => console.error(error));

