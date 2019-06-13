import { Component, Injectable } from '@angular/core';
import { FlatTreeControl } from '@ptsecurity/cdk/tree';
import { McTreeFlatDataSource, McTreeFlattener } from '@ptsecurity/mosaic/tree';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';


class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
}

const TREE_DATA = `
  {
  "rootNode_1": "app",
  "Pictures": {
        "Sun": "png",
        "Woods": "jpg",
        "Photo Booth Library": {
          "Contents": "dir",
          "Pictures": "dir"
        }
    },
    "Documents": {
      "angular": {
        "src": {
          "core": "ts",
          "compiler": "ts"
        }
      },
      "material2": {
        "src": {
          "button": "ts",
          "checkbox": "ts",
          "input": "ts"
        }
      }
    },
    "Downloads": {
        "Tutorial": "html",
        "November": "pdf",
        "October": "pdf"
    },
    "Applications": {
        "Chrome": "app",
        "Calendar": "app",
        "Webstorm": "app"
    }
}`;

@Injectable()
export class FileDatabase {
    dataChange: BehaviorSubject<FileNode[]> = new BehaviorSubject<FileNode[]>([]);

    get data(): FileNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        const dataObject = JSON.parse(TREE_DATA);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        //     file node as children.
        const data = this.buildFileTree(dataObject, 0);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `FileNode`.
     */
    buildFileTree(value: any, level: number): FileNode[] {
        const data: any[] = [];

        for (const k in value) {

            const v = value[k];
            const node = new FileNode();

            node.name = `${k}`;

            if (v === null || v === undefined) {
                // no action
            } else if (typeof v === 'object') {
                node.children = this.buildFileTree(v, level + 1);
            } else {
                node.type = v;
            }

            data.push(node);
        }

        return data;
    }
}

@Component({
    selector: 'tree-component',
    templateUrl: './tree.component.html',
    providers: [FileDatabase]
})
export class TreeComponent {
    treeControl: FlatTreeControl<FileFlatNode>;
    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    constructor(database: FileDatabase) {
        this.treeFlattener = new McTreeFlattener(
            this.transformer, this._getLevel, this._isExpandable, this._getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        database.dataChange.subscribe((data) => {
            this.dataSource.data = data;
        });
    }

    transformer(node: FileNode, level: number) {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    hasChild(_: number, _nodeData: FileFlatNode) { return _nodeData.expandable; }

    hasNestedChild(_: number, nodeData: FileNode) {
        return !(nodeData.type);
    }

    onNavigationChange($event) {
        console.log('onNavigationChange');
    }

    onSelectionChange($event) {
        console.log('onSelectionChange');
    }

    private _getLevel(node: FileFlatNode) { return node.level; }

    private _isExpandable(node: FileFlatNode) { return node.expandable; }

    private _getChildren = (node: FileNode): Observable<FileNode[]> => {
        return observableOf(node.children);
    }
}
