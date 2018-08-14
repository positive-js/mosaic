import { AfterContentInit, ContentChild, Directive, Input } from '@angular/core';
import { CdkTreeNodePadding } from '@ptsecurity/cdk/tree';
import { McIcon } from '@ptsecurity/mosaic/icon';


/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
@Directive({
    selector: '[mcTreeNodePadding]',
    providers: [{ provide: CdkTreeNodePadding, useExisting: McTreeNodePadding }]
})
export class McTreeNodePadding<T> extends CdkTreeNodePadding<T> implements AfterContentInit {
    get leftPadding(): number {
        return (this._innerIcon ? 0 : this._iconWidth) + this._baseLeftPadding;
    }

    _baseLeftPadding: number = 6;
    _iconWidth: number = 20;
    _indent: number = 16;

    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    @Input('mcTreeNodePadding') level: number;

    /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
    @Input('matTreeNodePaddingIndent') indent: number;

    @ContentChild(McIcon) _innerIcon: McIcon;

    _paddingIndent(): string | null {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return level ? `${(level * this._indent) + this.leftPadding}px` : `${this._baseLeftPadding}px`;
    }

    ngAfterContentInit(): void {
        this._setPadding();
    }
}
