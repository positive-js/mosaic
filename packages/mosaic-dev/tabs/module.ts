// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule, FormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, Observer } from 'rxjs';

import { McCheckboxModule } from '../../mosaic/checkbox';
import { McFormFieldModule } from '../../mosaic/form-field';
import { McIconModule } from '../../mosaic/icon';
import { McInputModule } from '../../mosaic/input/';
import { McRadioModule } from '../../mosaic/radio';
import { McTabsModule } from '../../mosaic/tabs/';


export interface IExampleTab {
    label: string;
    content: string;
}

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TabsDemoComponent {
    asyncTabs: Observable<IExampleTab[]>;
    timeout = 1000;

    tabs = ['First', 'Second', 'Third'];
    selected = new FormControl(0);

    tabLoadTimes: Date[] = [];

    links = ['First', 'Second', 'Third'];
    activeLink: any = this.links[0];
    background = '';

    constructor() {
        this.asyncTabs = new Observable((observer: Observer<IExampleTab[]>) => {
            setTimeout(
                () => {
                    observer.next([
                        { label: 'First', content: 'Content 1' },
                        { label: 'Second', content: 'Content 2' },
                        { label: 'Third', content: 'Content 3' }
                    ]);
                },
                this.timeout
            );
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

    selectedTabChange($event: any) {
        console.log('selectedTabChange Event:', $event);
    }
}


@NgModule({
    declarations: [
        TabsDemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
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
export class DemoModule {}
