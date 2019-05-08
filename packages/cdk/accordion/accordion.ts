import { Directive, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { Subject } from 'rxjs';


/** Used to generate unique ID for each accordion. */
let nextId = 0;

/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
@Directive({
    selector: 'cdk-accordion, [cdkAccordion]',
    exportAs: 'cdkAccordion'
})
export class CdkAccordion implements OnDestroy, OnChanges {
    /** Emits when the state of the accordion changes */
    readonly stateChanges = new Subject<SimpleChanges>();

    /** Stream that emits true/false when openAll/closeAll is triggered. */
    readonly openCloseAllActions: Subject<boolean> = new Subject<boolean>();

    /** A readonly id value to use for unique selection coordination. */
    readonly id = `cdk-accordion-${nextId++}`;

    /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
    @Input()
    get multi(): boolean {
        return this._multi;
    }

    set multi(multi: boolean) {
        this._multi = coerceBooleanProperty(multi);
    }

    private _multi: boolean = false;

    /** Opens all enabled accordion items in an accordion where multi is enabled. */
    openAll(): void {
        this.openCloseAll(true);
    }

    /** Closes all enabled accordion items in an accordion where multi is enabled. */
    closeAll(): void {
        this.openCloseAll(false);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.stateChanges.next(changes);
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    private openCloseAll(expanded: boolean): void {
        if (this.multi) {
            this.openCloseAllActions.next(expanded);
        }
    }
}
