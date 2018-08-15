import { Directive, Input, OnInit } from '@angular/core';
import { CdkTreeNodePadding } from '@ptsecurity/cdk/tree';


@Directive({
    selector: '[mcTreeNodePadding]',
    providers: [{ provide: CdkTreeNodePadding, useExisting: McTreeNodePadding }]
})
export class McTreeNodePadding<T> extends CdkTreeNodePadding<T> implements OnInit {
    get leftPadding(): number {
        return (this._withIcon ? 0 : this._iconWidth) + this._baseLeftPadding;
    }

    _baseLeftPadding: number = 6;
    _iconWidth: number = 20;
    _indent: number = 16;

    @Input('mcTreeNodePadding') level: number;

    @Input('mcTreeNodePaddingIndent') indent: number;

    _withIcon: boolean;

    _paddingIndent(): string | null {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;

        const level = this._level || nodeLevel;

        return level ? `${(level * this._indent) + this.leftPadding}px` : `${this._baseLeftPadding}px`;
    }

    ngOnInit(): void {
        this._withIcon = this._tree.treeControl.isExpandable(this._treeNode.data);
        this._setPadding();
    }
}
