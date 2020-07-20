// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McListModule, McListSelectionChange } from '@ptsecurity/mosaic/list';
import { of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    multipleSelected = ['Boots', 'Clogs'];
    multipleSelectedCheckbox: string[] = [];
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

    onSelectionChange($event: McListSelectionChange) {
        console.log(`onSelectionChange: ${$event.option.value}`);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McCheckboxModule,
        McListModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

