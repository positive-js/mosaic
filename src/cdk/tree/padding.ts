import { Directive, ElementRef, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';

import { Directionality } from '@ptsecurity/cdk/bidi';

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
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    @Input('cdkTreeNodePadding')
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this._level = value;

        this.setPadding();
    }

    /* tslint:disable-next-line:naming-convention */
    protected _level: number;

    @Input('cdkTreeNodePaddingIndent')
    get indent(): number {
        return this._indent;
    }

    set indent(value: number) {
        this._indent = value;

        this.setPadding();
    }

    /* tslint:disable-next-line:naming-convention */
    protected _indent: number;

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

    /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
    protected paddingIndent(): string | null {
        const nodeLevel = (this.treeNode.data && this.tree.treeControl.getLevel)
            ? this.tree.treeControl.getLevel(this.treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return level ? `${(level * this._indent) + 12}px` : '12px';
    }

    protected setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir && this.dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this.renderer.setStyle(this.element.nativeElement, paddingProp, padding);
    }
}
