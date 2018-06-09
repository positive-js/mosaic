import { Directive, Input } from '@angular/core';
import { CdkTreeNodePadding } from '@ptsecurity/cdk/tree';


/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
@Directive({
    selector: '[mcTreeNodePadding]',
    providers: [{ provide: CdkTreeNodePadding, useExisting: McTreeNodePadding }]
})
export class McTreeNodePadding<T> extends CdkTreeNodePadding<T> {

    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    @Input('mcTreeNodePadding') level: number;

    /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
    @Input('matTreeNodePaddingIndent') indent: number;

    _paddingIndent(): string | null {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return level ? `${(level * this._indent) + 8}px` : '8px';
    }
}
