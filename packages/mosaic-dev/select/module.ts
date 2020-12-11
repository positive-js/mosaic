/* tslint:disable:no-console */
import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule, McSelectChange } from '@ptsecurity/mosaic/select';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { OPTIONS } from './options';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
    singleSelected = '';
    multipleSelected = ['Normal', 'Hovered', 'Selected', 'Selected1'];

    singleSelectedWithSearch = 'Moscow';
    multipleSelectedWithSearch = ['Dzerzhinsk', 'Pskov'];

    singleSelectFormControl = new FormControl('', Validators.required);

    multiSelectSelectFormControl = new FormControl([], Validators.pattern(/^w/));

    searchCtrl: FormControl = new FormControl();
    filteredOptions: Observable<string[]>;

    multipleSearchCtrl: FormControl = new FormControl();
    filteredMultipleOptions: Observable<string[]>;

    optionCounter = 0;

    options: string[] = OPTIONS.sort();

    initialRange: ListRange = { start: 0, end: 7 } as unknown as ListRange;

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(OPTIONS),
            this.searchCtrl.valueChanges
                .pipe(map((value) => this.getFilteredOptions(value)))
        );

        this.filteredMultipleOptions = merge(
            of(OPTIONS),
            this.multipleSearchCtrl.valueChanges
                .pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    openedChange(opened) {
        console.log('openedChange: ', opened);
        if (!opened) {
            this.cdkVirtualScrollViewport.setRenderedContentOffset(0);
            this.cdkVirtualScrollViewport.setRenderedRange(this.initialRange);
        }
    }

    onSelectionChange($event: McSelectChange) {
        console.log(`onSelectionChange: ${$event.value}`);
    }

    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return `${hiddenItemsText} ${hiddenItems}`;
    }

    opened($event) {
        console.log('opened: ', $event);
    }

    closed($event) {
        console.log('closed: ', $event);
    }

    private getFilteredOptions(value): string[] {
        const searchFilter = (value && value.new) ? value.value : value;

        return searchFilter
            ? this.options.filter((option) =>
                option.toLowerCase().includes((searchFilter.toLowerCase())))
            : this.options;
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ScrollingModule,
        McSelectModule,

        McButtonModule,
        McInputModule,
        McFormFieldModule,
        McIconModule,
        ReactiveFormsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
