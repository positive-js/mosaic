import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { map } from 'rxjs/operators';

import { McTreeBase, McTreeNode } from './tree-base';


export class McTreeNodeToggleBase {}


// tslint:disable-next-line:naming-convention
export const McTreeNodeToggleMixinBase:
    CanDisableCtor & typeof McTreeNodeToggleBase = mixinDisabled(McTreeNodeToggleBase);

/** @docs-private */
@Directive()
export class McTreeNodeToggleBaseDirective<T> extends McTreeNodeToggleMixinBase implements CanDisable {
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
export class McTreeNodeToggleComponent<T> extends McTreeNodeToggleBaseDirective<T> {}


@Directive({
    selector: '[mc-tree-node-toggle], [mcTreeNodeToggle]',
    exportAs: 'mcTreeNodeToggle',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    }
})
export class McTreeNodeToggleDirective<T> extends McTreeNodeToggleBaseDirective<T> {}
