/* tslint:disable:no-reserved-keywords */
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FlatTreeControl, McTreeFlatDataSource, McTreeFlattener, McTreeSelection } from '@ptsecurity/mosaic/tree';
import { McTreeSelectChange } from '@ptsecurity/mosaic/tree-select';


export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = {
    docs: 'app',
    src: {
        cdk: {
            a11ly: {
                'aria describer': {
                    'aria-describer': 'ts',
                    'aria-describer.spec': 'ts',
                    'aria-reference': 'ts',
                    'aria-reference.spec': 'ts'
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts'
                }
            }
        },
        documentation: {
            source: '',
            tools: ''
        },
        mosaic: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts'
        },
        'mosaic-dev': {
            alert: '',
            badge: ''
        },
        'mosaic-examples': '',
        'mosaic-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json',
        wallabyTest: 'ts'
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts'
        },
        'tsconfig.deploy': 'json'
    },
    tests: ''
};

/**
 * @title Basic Select
 */
@Component({
    selector: 'tree-select-child-selection-overview-example',
    templateUrl: 'tree-select-child-selection-overview-example.html',
    styleUrls: ['tree-select-child-selection-overview-example.css']
})
export class TreeSelectChildSelectionOverviewExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    control = new FormControl(['Downloads', 'rootNode_1']);

    @ViewChild(McTreeSelection) selection: McTreeSelection;

    constructor() {
        this.treeFlattener = new McTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelectionChange($event: McTreeSelectChange) {
        this.toggleChildren($event);
        this.toggleParents($event.value.data.parent);
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.every((child: any) => this.selection?.selectionModel.isSelected(child));
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child: any) => this.selection?.selectionModel.isSelected(child));

        return result && !this.descendantsAllSelected(node);
    }

    private toggleChildren($event: McTreeSelectChange) {
        const valuesToChange: any = this.treeControl.getDescendants($event.value.data);
        if ($event.value.selected) {
            this.selection.selectionModel.deselect(...valuesToChange);
        } else {
            this.selection.selectionModel.select(...valuesToChange);
        }
        this.syncModel();
    }

    private toggleParents(parent) {
        if (!parent) { return; }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.selection.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.selection.selectionModel.selected.includes(d))) {
            this.selection.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.selection.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
        this.syncModel();
    }

    private syncModel() {
        this.control.setValue(this.selection.selectionModel.selected.map((o: any) => o.name));
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    }

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    }

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    }

    private getValue = (node: FileNode): string => {
        return node.name;
    }

    private getViewValue = (node: FileNode): string => {
        return `${node.name} view`;
    }
}
