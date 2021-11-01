// tslint:disable:no-console
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McListModule, McListSelectionChange } from '@ptsecurity/mosaic/list';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    multipleSelected = ['Boots', 'Clogs'];
    multipleSelectedCheckbox: string[] = [];
    selected = [];
    singleSelected = [];

    asyncUpdate = new FormControl();

    asyncUpdate$ = this.asyncUpdate.valueChanges.pipe(
        startWith(null),
        // tslint:disable-next-line:no-magic-numbers
        debounceTime(3000),
        switchMap(() => {
            return of(this.typesOfShoes);
        })
    );

    constructor(private clipboard: Clipboard) {}

    onSelectionChange($event: McListSelectionChange) {
        console.log(`onSelectionChange: ${$event.option.value}`);
    }

    onSelectAll($event) {
        console.log('onSelectAll', $event);
    }

    onCopy($event) {
        console.log('onCopy', $event);
        this.clipboard.copy($event.option.value);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        McCheckboxModule,
        McListModule,
        McToolTipModule,
        McDropdownModule,
        McIconModule,
        ClipboardModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
