import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CdkTree, CdkTreeNode } from './tree';


/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;

/**
 * Indent for the children tree dataNodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
@Directive({
    selector: '[cdkTreeNodePadding]'
})
export class CdkTreeNodePadding<T> implements OnDestroy {

    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    @Input('cdkTreeNodePadding')
    get level(): number { return this._level; }
    set level(value: number) { this.setLevelInput(value); }

    /* tslint:disable-next-line:naming-convention orthodox-getter-and-setter */
    _level: number;

    @Input('cdkTreeNodePaddingIndent')
    get indent(): number | string { return this._indent; }
    set indent(indent: number | string) { this.setIndentInput(indent); }

    /* tslint:disable-next-line:naming-convention orthodox-getter-and-setter */
    _indent: number = 20;

    /** CSS units used for the indentation value. */
    indentUnits = 'px';

    private destroyed = new Subject<void>();

    constructor(
        protected treeNode: CdkTreeNode<T>,
        protected tree: CdkTree<T>,
        private renderer: Renderer2,
        private element: ElementRef<HTMLElement>,
        @Optional() private dir: Directionality
    ) {

        if (this.dir && this.dir.change) {
            this.dir.change
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => this.setPadding());
        }
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    // tslint:disable-next-line:naming-convention
    protected setLevelInput(value: number) {
        // Set to null as the fallback value so that _setPadding can fall back to the node level if the
        // consumer set the directive as `cdkTreeNodePadding=""`. We still want to take this value if
        // they set 0 explicitly.
        this._level = coerceNumberProperty(value, null)!;
        this.setPadding();
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    protected setIndentInput(indent: number | string) {
        let value = indent;
        let units = 'px';

        if (typeof indent === 'string') {
            const parts = indent.split(cssUnitPattern);
            value = parts[0];
            units = parts[1] || units;
        }

        this.indentUnits = units;
        this._indent = coerceNumberProperty(value);
        this.setPadding();
    }

    /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
    protected paddingIndent(): string | null {
        const basicPadding = 12;
        const nodeLevel = (this.treeNode.data && this.tree.treeControl.getLevel)
            ? this.tree.treeControl.getLevel(this.treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return `${level ? (level * this._indent) + basicPadding : basicPadding}px`;
    }

    protected setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir && this.dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this.renderer.setStyle(this.element.nativeElement, paddingProp, padding);
    }
}
