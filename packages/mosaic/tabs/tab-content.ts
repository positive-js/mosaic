import { Directive, InjectionToken, TemplateRef } from '@angular/core';


export const MC_TAB_CONTENT = new InjectionToken<McTabContent>('McTabContent');

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
    selector: '[mcTabContent]',
    providers: [{provide: MC_TAB_CONTENT, useExisting: McTabContent}]
})
export class McTabContent {
    constructor(public template: TemplateRef<any>) {}
}
