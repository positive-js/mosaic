import { Directive, ElementRef, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';

import { Directionality } from '@ptsecurity/cdk/bidi';
// import {coerceNumberProperty} from '@ptsecurity/cdk/coercion';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CdkTree, CdkTreeNode } from './tree';


/**
 * Indent for the children tree dataNodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
@Directive({
    selector: '[cdkTreeNodePadding]'
})
export class CdkTreeNodePadding<T> implements OnDestroy {
    /** Subject that emits when the component has been destroyed. */

    _level: number;
    _indent: number;

    private _destroyed = new Subject<void>();

    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    @Input('cdkTreeNodePadding')
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        // this._level = coerceNumberProperty(value);
        this._level = value;
        this._setPadding();
    }


    @Input('cdkTreeNodePaddingIndent')
    get indent(): number {
        return this._indent;
    }

    set indent(value: number) {
        // this._indent = coerceNumberProperty(value);
        this._indent = value;
        this._setPadding();
    }


    constructor(
        protected _treeNode: CdkTreeNode<T>,
        protected _tree: CdkTree<T>,
        private _renderer: Renderer2,
        private _element: ElementRef,
        @Optional() private _dir: Directionality
    ) {
        this._setPadding();

        if (this._dir) {
            this._dir.change
                .pipe(takeUntil(this._destroyed))
                .subscribe(() => this._setPadding());
        }
    }

    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }

    /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
    _paddingIndent(): string | null {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return level ? `${(level * this._indent) + 12}px` : '12px';
    }

    _setPadding() {
        const padding = this._paddingIndent();
        const paddingProp = this._dir && this._dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this._renderer.setStyle(this._element.nativeElement, paddingProp, padding);
    }
}
