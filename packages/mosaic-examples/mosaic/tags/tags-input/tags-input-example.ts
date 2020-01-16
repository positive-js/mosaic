import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@ptsecurity/cdk/keycodes';
import { McTagInputEvent } from '@ptsecurity/mosaic/tags';


/**
 * @title Basic tags input
 */
@Component({
    selector: 'tags-input-example',
    templateUrl: 'tags-input-example.html',
    styleUrls: ['tags-input-example.css']
})
export class TagsInputExample {
    control = new FormControl();

    tags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

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

    onRemoveTag(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    onClear(): void {
        this.tags.length = 0;
    }
}
