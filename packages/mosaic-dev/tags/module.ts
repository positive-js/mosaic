// tslint:disable:no-console
import {
    AfterViewInit,
    Component,
    ElementRef,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER, SPACE, TAB } from '@ptsecurity/cdk/keycodes';
import { McAutocomplete, McAutocompleteModule, McAutocompleteSelectedEvent } from '@ptsecurity/mosaic/autocomplete';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagList, McTagsModule, McTagInputEvent } from '@ptsecurity/mosaic/tags';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements AfterViewInit {
    themePalette = ThemePalette;

    addOnBlur = false;
    visible = true;
    tagCtrl = new FormControl();

    simpleTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    inputTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    enterTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    autocompleteAllTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    autocompleteSelectedTags: string[] = ['tag1'];
    autocompleteFilteredTagsByInput: string[] = [];
    autocompleteFilteredTags: any;

    readonly separatorKeysCodes: number[] = [ENTER, SPACE, TAB, COMMA];

    @ViewChild('inputTagInput', {static: false}) inputTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('inputTagList', {static: false}) inputTagList: McTagList;

    @ViewChild('autocompleteTagInput', {static: false}) autocompleteTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('autocompleteTagList', {static: false}) autocompleteTagList: McTagList;
    @ViewChild('autocomplete', {static: false}) autocomplete: McAutocomplete;

    @ViewChild('enterTagInput', {static: false}) enterTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('enterInputTagList', {static: false}) enterInputTagList: McTagList;

    ngAfterViewInit(): void {
        this.autocompleteFilteredTags = merge(
            this.autocompleteTagList.tagChanges.asObservable()
                .pipe(map((selectedTags) => {
                    const values = selectedTags.map((tag) => tag.value);

                    return this.autocompleteAllTags.filter((tag) => !values.includes(tag));
                })),
            this.tagCtrl.valueChanges
                .pipe(map((value) => {
                    const typedText = (value && value.new) ? value.value : value;

                    this.autocompleteFilteredTagsByInput = typedText ?
                        this.filter(typedText) : this.autocompleteAllTags.slice();

                    return this.autocompleteFilteredTagsByInput.filter(
                        // @ts-ignore
                        (tag) => !this.autocompleteSelectedTags.includes(tag)
                    );
                }))
        );
    }

    onClear(): void {
        this.inputTags.length = 0;
    }

    inputOnCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.inputTags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    enterOnCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.enterTags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    autocompleteOnCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            const isOptionSelected = this.autocomplete.options.some((option) => option.selected);
            if (!isOptionSelected) {
                this.autocompleteSelectedTags.push(value.trim());
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.tagCtrl.setValue(null);
    }

    addOnBlurFunc(event: FocusEvent) {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        if (!target || target.tagName !== 'MC-OPTION') {
            const mcTagEvent: McTagInputEvent = {
                input: this.autocompleteTagInput.nativeElement,
                value : this.autocompleteTagInput.nativeElement.value
            };

            this.autocompleteOnCreate(mcTagEvent);
        }
    }

    autocompleteOnSelect(event: McAutocompleteSelectedEvent): void {
        event.option.deselect();
        if (event.option.value.new) {
            this.autocompleteSelectedTags.push(event.option.value.value);
        } else {
            this.autocompleteSelectedTags.push(event.option.value);
        }
        this.autocompleteTagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    autocompleteOnRemove(fruit: any): void {
        const index = this.autocompleteSelectedTags.indexOf(fruit);

        if (index >= 0) {
            this.autocompleteSelectedTags.splice(index, 1);
        }
    }

    onRemoveTag(tag: string): void {
        const index = this.simpleTags.indexOf(tag);

        if (index >= 0) {
            this.simpleTags.splice(index, 1);
        }
    }

    inputOnRemoveTag(tag: string): void {
        const index = this.inputTags.indexOf(tag);

        if (index >= 0) {
            this.inputTags.splice(index, 1);
        }
    }

    enterOnRemoveTag(tag: string): void {
        const index = this.enterTags.indexOf(tag);

        if (index >= 0) {
            this.enterTags.splice(index, 1);
        }
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        // todo добавить фильтрацию
        return this.autocompleteAllTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
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


