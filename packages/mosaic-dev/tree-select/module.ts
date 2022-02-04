/* tslint:disable:no-console no-reserved-keywords */
import {
    Component,
    NgModule,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McHighlightModule, McPseudoCheckboxModule, McPseudoCheckboxState } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import {
    McTreeFlatDataSource,
    McTreeFlattener,
    FlatTreeControl,
    McTreeModule,
    McTreeOption
} from '@ptsecurity/mosaic/tree';
import { McTreeSelect, McTreeSelectChange, McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';


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
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: {
            Contents: 'dir',
            Pictures_2: 'dir'
        }
    },
    Documents: {
        Pictures_3: 'Pictures',
        angular: {
            src1: {
                core: 'ts',
                compiler: 'ts'
            }
        },
        material2: {
            src2: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts'
            }
        }
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app',
        Webstorm: 'app'
    }
};


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
    @ViewChild(McTreeSelect) select: McTreeSelect;

    disabledState: boolean = false;

    control = new FormControl(['rootNode_1', 'Downloads']);

    // modelValue = 'Chrome';
    modelValue: any[] | null = ['Applications', 'Documents', 'Calendar', 'Chrome'];

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    multiSelectSelectFormControl = new FormControl([], Validators.pattern(/^w/));

    searchControl: FormControl = new FormControl();

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

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelectionChange($event: McTreeSelectChange) {
        const option: McTreeOption = $event.value;
        console.log(`onSelectionChange: ${$event.value}`);

        if (option.isExpandable) {
            this.toggleChildren(option);
        }

        this.toggleParents($event.value.data.parent);
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.every((child: any) => this.select?.selectionModel.isSelected(child));
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.some((child: any) => this.select?.selectionModel.isSelected(child));
    }

    pseudoCheckboxState(option: McTreeOption): McPseudoCheckboxState {
        if (option.isExpandable) {
            const node: FileFlatNode = option.data as unknown as FileFlatNode;

            if (this.descendantsAllSelected(node)) {
                return 'checked';
            } else if (this.descendantsPartiallySelected(node)) {
                return 'indeterminate';
            }
        }

        return option.selected ? 'checked' : 'unchecked';
    }

    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return `${hiddenItemsText} ${hiddenItems}`;
    }

    openedChange($event) {
        console.log('openedChange: ', $event);
    }

    opened($event) {
        console.log('opened: ', $event);
    }

    closed($event) {
        console.log('closed: ', $event);
    }

    private toggleChildren(option: McTreeOption) {
        const valuesToChange: any = this.treeControl.getDescendants(option.data as unknown as FileFlatNode);

        if (option.selected) {
            this.select.selectionModel.deselect(...valuesToChange);
        } else {
            this.select.selectionModel.select(...valuesToChange);
        }
    }

    private toggleParents(parent) {
        if (!parent) { return; }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.select.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.select.selectionModel.selected.includes(d))) {
            this.select.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.select.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
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


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McTreeModule,
        McTreeSelectModule,
        McSelectModule,
        McHighlightModule,

        McButtonModule,
        McInputModule,
        McFormFieldModule,
        McIconModule,
        ReactiveFormsModule,
        McPseudoCheckboxModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
