import { Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { CdkTree, CdkTreeNode, CdkTreeNodeToggle } from '@ptsecurity/cdk/tree';
import { map } from 'rxjs/operators';


@Component({
    selector: 'mc-tree-node-toggle',
    template: `
        <i class="mc mc-icon mc-angle-down-S_16"></i>
    `,
    host: {
        class: 'mc-tree-node-toggle',
        '(click)': 'toggle($event)',
        '[class.mc-opened]': 'iconState',
        '[attr.disabled]': 'disabled || null'
    },
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggleComponent }]
})
export class McTreeNodeToggleComponent<T> extends CdkTreeNodeToggle<T> {
    disabled: boolean = false;

    @Input() node: T;

    get iconState(): any {
        return this.disabled || this.tree.treeControl.isExpanded(this.node);
    }

    constructor(tree: CdkTree<T>, treeNode: CdkTreeNode<T>) {
        super(tree, treeNode);

        this.tree.treeControl.filterValue
            .pipe(map((value) => value.length > 0))
            .subscribe((state: boolean) => this.disabled = state);
    }
}

@Directive({
    selector: '[mcTreeNodeToggle]',
    host: {
        '(click)': 'toggle($event)',
        '[attr.disabled]': 'disabled || null'
    },
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggleDirective }]
})
export class McTreeNodeToggleDirective<T> extends CdkTreeNodeToggle<T> {
    disabled: boolean = false;

    constructor(tree: CdkTree<T>, treeNode: CdkTreeNode<T>) {
        super(tree, treeNode);

        this.tree.treeControl.filterValue
            .pipe(map((value) => value.length > 0))
            .subscribe((state: boolean) => this.disabled = state);
    }
}
