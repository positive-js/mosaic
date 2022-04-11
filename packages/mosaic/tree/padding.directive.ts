import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2
} from '@angular/core';
import { TreeSizePaddingLeft } from '@ptsecurity/mosaic/design-tokens';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McTreeBase, McTreeNode } from './tree-base';


/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;


@Directive({
    selector: '[mcTreeNodePadding]',
    exportAs: 'mcTreeNodePadding'
})
export class McTreeNodePadding<T> implements OnInit, OnDestroy {
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this.setLevelInput(value);
    }

    private _level: number;

    @Input('mcTreeNodePaddingIndent')
    get indent(): number | string {
        return this._indent;
    }

    set indent(indent: number | string) {
        this.setIndentInput(indent);
    }

    private _indent: number = 20;

    get leftPadding(): number {
        return (this.withIcon ? 0 : this.iconWidth) + this.baseLeftPadding;
    }

    /** CSS units used for the indentation value. */
    indentUnits = 'px';

    baseLeftPadding: number = parseInt(TreeSizePaddingLeft);

    withIcon: boolean;
    iconWidth: number = 24;

    private destroyed = new Subject<void>();

    constructor(
        protected treeNode: McTreeNode<T>,
        protected tree: McTreeBase<T>,
        private renderer: Renderer2,
        private element: ElementRef<HTMLElement>,
        @Optional() private dir: Directionality
    ) {
        this.dir?.change?.pipe(takeUntil(this.destroyed))
            .subscribe(() => this.setPadding());
    }

    ngOnInit(): void {
        this.withIcon = this.element.nativeElement.querySelector('i[mctreenodetoggle]:first-child') !== null;

        this.setPadding();
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }

    paddingIndent(): string | null {
        const nodeLevel = (this.treeNode.data && this.tree.treeControl.getLevel)
            ? this.tree.treeControl.getLevel(this.treeNode.data)
            : 0;

        const level = this.level || nodeLevel;

        return level > 0 ? `${(level * this._indent) + this.leftPadding}px` : `${this.leftPadding}px`;
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    private setLevelInput(value: number) {
        // Set to null as the fallback value so that _setPadding can fall back to the node level if the
        // consumer set the directive as `mcTreeNodePadding=""`. We still want to take this value if
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
    private setIndentInput(indent: number | string) {
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

    private setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir?.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this.renderer.setStyle(this.element.nativeElement, paddingProp, padding);
    }
}
