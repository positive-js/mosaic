import { Directive, Input, OnInit } from '@angular/core';
import { CdkTreeNodePadding } from '@ptsecurity/cdk/tree';


@Directive({
    selector: '[mcTreeNodePadding]',
    providers: [{ provide: CdkTreeNodePadding, useExisting: McTreeNodePadding }]
})
export class McTreeNodePadding<T> extends CdkTreeNodePadding<T> implements OnInit {
    @Input('mcTreeNodePadding') level: number;

    @Input('mcTreeNodePaddingIndent') indent: number;

    baseLeftPadding: number = 6;
    /* tslint:disable-next-line:naming-convention */
    _indent: number = 16;

    withIcon: boolean;
    iconWidth: number = 20;

    get leftPadding(): number {
        return (this.withIcon ? 0 : this.iconWidth) + this.baseLeftPadding;
    }

    paddingIndent(): string | null {
        const nodeLevel = (this.treeNode.data && this.tree.treeControl.getLevel)
            ? this.tree.treeControl.getLevel(this.treeNode.data)
            : null;

        const level = this.level || nodeLevel;

        return level ? `${(level * this._indent) + this.leftPadding}px` : `${this.baseLeftPadding}px`;
    }

    ngOnInit(): void {
        this.withIcon = this.tree.treeControl.isExpandable(this.treeNode.data);

        this.setPadding();
    }
}
