import { Directive, ElementRef } from '@angular/core';


/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
    selector: '[mcAutocompleteOrigin]',
    exportAs: 'mcAutocompleteOrigin'
})
export class McAutocompleteOrigin {
    constructor(public elementRef: ElementRef<HTMLElement>) {}
}
