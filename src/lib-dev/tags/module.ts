import { Component, ElementRef, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER } from '@ptsecurity/cdk/keycodes';
import { McAutocomplete, McAutocompleteModule, McAutocompleteSelectedEvent } from '@ptsecurity/mosaic/autocomplete';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTagInputEvent } from '@ptsecurity/mosaic/tags/tag-input';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/operators';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    tagCtrl = new FormControl();

    tags: string[] = ['tag1'];
    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
    filteredTags: any;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') mcAutocomplete: McAutocomplete;

    constructor() {
        this.filteredTags = this.tagCtrl.valueChanges
            .pipe(
                startWith(null),
                map((fruit: string | null) => {
                    return fruit ? this.filter(fruit) : this.allTags.slice();
                })
            );
    }

    add(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    remove(fruit: any): void {
        const index = this.tags.indexOf(fruit);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    selected(event: McAutocompleteSelectedEvent): void {
        this.tags.push(event.option.viewValue);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        // todo добавить фильтрацию
        return this.allTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
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
        McFormFieldModule,
        ReactiveFormsModule,

        McAutocompleteModule,
        McTagsModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

