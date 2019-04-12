import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ElementRef,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER } from '@ptsecurity/cdk/keycodes';
import { McAutocomplete, McAutocompleteModule, McAutocompleteSelectedEvent } from '@ptsecurity/mosaic/autocomplete';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagList, McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTagInputEvent } from '@ptsecurity/mosaic/tags/tag-input';
import { from } from 'rxjs';
import { merge } from 'rxjs/internal/observable/merge';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/operators';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements AfterViewInit, AfterContentInit {
    visible = true;
    tagCtrl = new FormControl();

    tags: string[] = ['tag1'];
    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    filteredTags: any;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('autocomplete') mcAutocomplete: McAutocomplete;
    @ViewChild('tagList') tagList: McTagList;
    filteredByTagsList: any[] = [];
    filteredByInput: any[] = [];

    constructor() {}


    ngAfterContentInit(): void {
        console.log('ngAfterContentInit');

        this.filteredTags = merge(
            this.tagList.tagChanges.asObservable()
                .pipe(map((tags) => {
                    const values = tags.map((tag) => tag.value);

                    this.filteredByTagsList = this.allTags.filter((tag) => !values.includes(tag));

                    return this.filteredByTagsList;
                    // return this.filteredByInput.filter((tag) => !this.filteredByTagsList.includes(tag));
                })),
            this.tagCtrl.valueChanges
                .pipe(map((value) => {
                    const tag = (value && value.new) ? value.value : value;

                    this.filteredByInput = tag ? this.filter(tag) : this.allTags.slice();

                    return this.filteredByInput.filter((tag) => !this.tags.includes(tag));
                }))
        );
    }

    ngAfterViewInit(): void {
        console.log('ngAfterViewInit');
    }

    onChangedTagList() {
        console.log('onChangedTagList');
    }

    onCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    onSelect(event: McAutocompleteSelectedEvent): void {
        if (event.option.value.new) {
            this.tags.push(event.option.value.value);
        } else {
            this.tags.push(event.option.value);
        }
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    onRemove(fruit: any): void {
        const index = this.tags.indexOf(fruit);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        // todo добавить фильтрацию
        return this.allTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McFormFieldModule,
        ReactiveFormsModule,

        McAutocompleteModule,
        McTagsModule,
        McIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

