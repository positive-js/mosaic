import { Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { CdkTree, CdkTreeNode } from '@ptsecurity/cdk/tree';
import { map } from 'rxjs/operators';


@Component({
    selector: 'mc-tree-node-toggle',
    template: `
        <i class="mc mc-icon mc-angle-down-S_16"></i>
    `,
    host: {
        class: 'mc-tree-node-toggle',
        '[class.mc-opened]': 'iconState',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    },
    encapsulation: ViewEncapsulation.None
})
export class McTreeNodeToggleComponent<T> {
    disabled: boolean = false;

    @Input() node: T;

    @Input('cdkTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: boolean) {
        this._recursive = value;
    }

    private _recursive = false;

    toggle(event: Event): void {
        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }

    get iconState(): any {
        return this.disabled || this.tree.treeControl.isExpanded(this.node);
    }

    constructor(private tree: CdkTree<T>, private treeNode: CdkTreeNode<T>) {
        this.tree.treeControl.filterValue
            .pipe(map((value) => value.length > 0))
            .subscribe((state: boolean) => this.disabled = state);
    }
}

@Directive({
    selector: '[mcTreeNodeToggle]',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    }
})
export class McTreeNodeToggleDirective<T> {
    disabled: boolean = false;

    @Input('cdkTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: boolean) {
        this._recursive = value;
    }

    private _recursive = false;

    constructor(private tree: CdkTree<T>, private treeNode: CdkTreeNode<T>) {

        this.tree.treeControl.filterValue
            .pipe(map((value) => value.length > 0))
            .subscribe((state: boolean) => this.disabled = state);
    }


    toggle(event: Event): void {
        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}
