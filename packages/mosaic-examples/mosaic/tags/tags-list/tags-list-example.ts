import { Component } from '@angular/core';


/**
 * @title Basic tags list
 */
@Component({
    selector: 'tags-list-example',
    templateUrl: 'tags-list-example.html',
    styleUrls: ['tags-list-example.css']
})
export class TagsListExample {
    simpleTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    onRemoveTag(tag: string): void {
        const index = this.simpleTags.indexOf(tag);

        if (index >= 0) {
            this.simpleTags.splice(index, 1);
        }
    }
}
