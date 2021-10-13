import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { CanDisable, mixinDisabled } from '@ptsecurity/mosaic/core';
import { map } from 'rxjs/operators';

import { McTreeBase, McTreeNode } from './tree-base';


/** @docs-private */
@Directive()
export class McTreeNodeToggleBase<T> extends mixinDisabled(class {}) implements CanDisable {
    @Input() node: T;

    @Input('mcTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: any) {
        this._recursive = coerceBooleanProperty(value);
    }

    private _recursive = false;

    get iconState(): boolean {
        return this.tree.treeControl.isExpanded(this.node);
    }

    constructor(private tree: McTreeBase<T>, private treeNode: McTreeNode<T>) {
        super();

        this.tree.treeControl.filterValue
            .pipe(map((value) => value?.length > 0))
            .subscribe((state: boolean) => this.disabled = state);
    }

    toggle(event: Event): void {
        if (this.disabled) { return; }

        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}


@Component({
    selector: 'mc-tree-node-toggle',
    exportAs: 'mcTreeNodeToggle',
    template: `<i class="mc mc-icon mc-angle-down-S_16"></i>`,
    styleUrls: ['./toggle.scss'],
    host: {
        class: 'mc-tree-node-toggle',
        '[class.mc-opened]': 'iconState',

        '[attr.disabled]': 'disabled || null',

        '(click)': 'toggle($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTreeNodeToggleComponent<T> extends McTreeNodeToggleBase<T> {}


@Directive({
    selector: '[mcTreeNodeToggle]',
    exportAs: 'mcTreeNodeToggle',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    }
})
export class McTreeNodeToggleDirective<T> extends McTreeNodeToggleBase<T> {}
