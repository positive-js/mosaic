/* tslint:disable:no-magic-numbers no-reserved-keywords */
/* tslint:disable:mocha-no-side-effect-code */
/* tslint:disable:no-non-null-assertion */
/* tslint:disable:no-empty */
/* tslint:disable:prefer-for-of */
// tslint:disable:max-func-body-length

import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {
    waitForAsync,
    ComponentFixture,
    fakeAsync,
    flush,
    inject,
    TestBed,
    tick
} from '@angular/core/testing';
import {
    ControlValueAccessor,
    FormControl,
    FormGroup,
    FormGroupDirective,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW,
    A,
    ESCAPE
} from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    wrappedErrorMessage
} from '@ptsecurity/cdk/testing';
import {
    ErrorStateMatcher,
    getMcSelectDynamicMultipleError,
    getMcSelectNonArrayValueError,
    getMcSelectNonFunctionValueError,
    McPseudoCheckboxModule,
    McPseudoCheckboxState
} from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import {
    FlatTreeControl,
    McTreeFlatDataSource,
    McTreeFlattener,
    McTreeModule,
    McTreeOption,
    McTreeSelectionChange
} from '@ptsecurity/mosaic/tree';
import { Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


const TREE_DATA = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        Photo_Booth_Library: {
          Contents: 'dir',
          Pictures: 'dir'
        }
    },
    Documents: {
      angular: {
        src: {
          core: 'ts',
          compiler: 'ts'
        }
      },
      material2: {
        src: {
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

const TREE_DATA_RESET = {
    rootNode_1: 'app',
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    'Null-option': null,
    'Falsy-option': false,
    'Undefined-option': undefined
};

class FileNode {
    children: FileNode[];
    name: string;
    type: any;
    value: any;
}

class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    value: any;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
function buildFileTree(value: any, level: number): FileNode[] {
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
function buildFileTreeWithValues(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === false || v === undefined) {
            node.value = v;
        } else if (typeof v === 'object') {
                 node.children = buildFileTree(v, level + 1);
        } else {
            node.value = v;
        }

        data.push(node);
    }

    return data;
}

import { McTreeSelectModule, McTreeSelect, McTreeSelectChange } from './index';


/** The debounce interval when typing letters to select an option. */
const LETTER_KEY_DEBOUNCE_INTERVAL = 200;

const transformer = (node: FileNode, level: number, parent: any) => {
    const flatNode = new FileFlatNode();

    flatNode.name = node.name;
    flatNode.parent = parent;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
};

const getLevel = (node: FileFlatNode) => node.level;

const getValue = (node: FileFlatNode) => node.name;

const getVal = (node: FileFlatNode) => node.value;

const isExpandable = (node: FileFlatNode) => node.expandable;

const getChildren = (node: FileNode): Observable<FileNode[]> => {
    return observableOf(node.children);
};


@Component({
    selector: 'basic-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <mc-form-field>
            <mc-tree-select
                placeholder="Food"
                [formControl]="control"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass">

                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">
                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option
                        *mcTreeNodeDef="let node; when: hasChild"
                        mcTreeNodePadding
                        [disabled]="node.name === 'Downloads'">

                        <i mc-icon="mc-angle-down-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
        <div [style.height.px]="heightBelow"></div>
    `
})
class BasicTreeSelect {
    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    heightAbove = 0;
    heightBelow = 0;
    tabIndexOverride: number;
    panelClass = ['custom-one', 'custom-two'];

    @ViewChild(McTreeSelect, {static: true}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-events',
    template: `
        <mc-form-field>
            <mc-tree-select (openedChange)="openedChangeListener($event)"
                            (opened)="openedListener()"
                            (closed)="closedListener()">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">
                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option
                        *mcTreeNodeDef="let node; when: hasChild"
                        mcTreeNodePadding
                        [disabled]="node.name === 'Downloads'">

                        <i mc-icon="mc-angle-down-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicEvents {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    openedChangeListener = jasmine.createSpy('McTreeSelect openedChange listener');
    openedListener = jasmine.createSpy('McTreeSelect opened listener');
    closedListener = jasmine.createSpy('McTreeSelect closed listener');

    @ViewChild(McTreeSelect, { static: true }) select: McTreeSelect;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'ng-model-select',
    template: `
        <mc-form-field>
            <mc-tree-select
                placeholder="Food"
                ngModel
                [disabled]="isDisabled">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">
                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class NgModelSelect {
    isDisabled: boolean;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'many-selects',
    template: `
        <mc-form-field>
            <mc-tree-select
                placeholder="First">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>

        <mc-form-field>
            <mc-tree-select
                placeholder="Second">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class ManySelects {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'ng-if-select',
    template: `
        <div *ngIf="isShowing">
            <mc-form-field>
                <mc-tree-select
                    placeholder="Food I want to eat right now"
                    [formControl]="control">

                    <mc-tree-selection
                        [dataSource]="dataSource"
                        [treeControl]="treeControl">

                        <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                            {{ treeControl.getViewValue(node) }}
                        </mc-tree-option>

                        <mc-tree-option
                                                        *mcTreeNodeDef="let node; when: hasChild"
                            mcTreeNodePadding>
                            <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                            {{ treeControl.getViewValue(node) }}
                        </mc-tree-option>
                    </mc-tree-selection>
                </mc-tree-select>
            </mc-form-field>
        </div>
    `
})
class NgIfSelect {
    isShowing = false;

    control = new FormControl('rootNode_1');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'select-with-search',
    template: `
        <mc-form-field>
            <mc-tree-select [formControl]="control">
                <mc-form-field mcFormFieldWithoutBorders mcSelectSearch>
                    <i mcPrefix mc-icon="mc-search_16"></i>
                    <input mcInput [formControl]="searchControl" type="text"/>
                    <mc-cleaner></mc-cleaner>
                </mc-form-field>

                <div mc-select-search-empty-result>Ничего не найдено</div>

                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SelectWithSearch implements OnInit {
    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;
    searchControl: FormControl = new FormControl();

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
    }
}

@Component({
    selector: 'select-with-change-event',
    template: `
        <mc-form-field>
            <mc-tree-select
                (selectionChange)="changeListener($event)">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option
                                                *mcTreeNodeDef="let node; when: hasChild"
                        mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SelectWithChangeEvent {
    changeListener = jasmine.createSpy('McTreeSelect change listener');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'select-init-without-options',
    template: `
        <mc-form-field>
            <mc-tree-select  [(ngModel)]="selected" placeholder="Food I want to eat right now" [formControl]="control">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild"
                        mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SelectInitWithoutOptions {
    control = new FormControl('rootNode_1');
    selected = '';

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'custom-select-accessor',
    template: `
        <mc-form-field>
            <mc-tree-select></mc-tree-select>
        </mc-form-field>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomSelectAccessor,
        multi: true
    }]
})
class CustomSelectAccessor implements ControlValueAccessor {
    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    writeValue: (value?: any) => void = () => {};
    registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
    registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
    selector: 'comp-with-custom-select',
    template: `
        <custom-select-accessor [formControl]="ctrl"></custom-select-accessor>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomSelectAccessor,
        multi: true
    }]
})
class CompWithCustomSelect {
    ctrl = new FormControl('initial value');
    @ViewChild(CustomSelectAccessor, {static: true}) customAccessor: CustomSelectAccessor;
}

@Component({
    selector: 'select-infinite-loop',
    template: `
        <mc-form-field>
            <mc-tree-select [(ngModel)]="value"></mc-tree-select>
        </mc-form-field>
        <throws-error-on-init></throws-error-on-init>
    `
})
class SelectWithErrorSibling {
    value: string;
}

@Component({
    selector: 'throws-error-on-init',
    template: ''
})
class ThrowsErrorOnInit implements OnInit {
    ngOnInit() {
        throw Error('Oh no!');
    }
}

@Component({
    selector: 'basic-select-on-push',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [formControl]="control">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectOnPush {
    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-select-on-push-preselected',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [formControl]="control">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectOnPushPreselected {
    control = new FormControl('rootNode_1');

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'multi-select',
    template: `
        <mc-form-field>
            <mc-tree-select
                [multiple]="true"
                placeholder="Food"
                [formControl]="control">

                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class MultiSelect {
    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'select-with-plain-tabindex',
    template: `
        <mc-form-field>
            <mc-tree-select></mc-tree-select>
        </mc-form-field>`
})
class EmptySelect {}

@Component({
    selector: 'select-early-sibling-access',
    template: `
        <mc-form-field>
            <mc-tree-select #select="mcTreeSelect"></mc-tree-select>
        </mc-form-field>
    `
})
class SelectEarlyAccessSibling {}

@Component({
    selector: 'basic-select-initially-hidden',
    template: `
        <mc-form-field>
            <mc-tree-select [style.display]="isVisible ? 'block' : 'none'">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectInitiallyHidden {
    isVisible = false;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-select-no-placeholder',
    template: `
        <mc-form-field>
            <mc-tree-select>
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectNoPlaceholder {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'basic-select-with-theming',
    template: `
        <mc-form-field [color]="theme">
            <mc-tree-select placeholder="Food">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectWithTheming {
    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    theme: string;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA_RESET, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'reset-values-select',
    template: `
        <mc-form-field>
            <mc-tree-select [formControl]="control">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class ResetValuesSelect {
    control = new FormControl();

    @ViewChild(McTreeSelect, { static: false }) select: McTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getVal, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTreeWithValues(TREE_DATA_RESET, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select [formControl]="control">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class FalsyValueSelect {
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <form>
            <mc-form-field>
                <mc-tree-select [(ngModel)]="value"></mc-tree-select>
            </mc-form-field>
        </form>
    `
})
class InvalidSelectInForm {
    value: any;
}

@Component({
    template: `
        <form [formGroup]="formGroup">
            <mc-form-field>
                <mc-tree-select placeholder="Food" formControlName="food">
                    <mc-tree-selection
                        [dataSource]="dataSource"
                        [treeControl]="treeControl">

                        <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                            {{ treeControl.getViewValue(node) }}
                        </mc-tree-option>

                        <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                            <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                            {{ treeControl.getViewValue(node) }}
                        </mc-tree-option>
                    </mc-tree-selection>
                </mc-tree-select>
                <!--<mc-error>This field is required</mc-error>-->
            </mc-form-field>
        </form>
    `
})
class SelectInsideFormGroup {
    @ViewChild(FormGroupDirective, {static: false}) formGroupDirective: FormGroupDirective;
    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    formControl = new FormControl('', Validators.required);
    formGroup = new FormGroup({
        food: this.formControl
    });

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutForms {
    selectedFood: string | null;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutFormsPreselected {
    selectedFood = 'Pictures';

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [(ngModel)]="selectedFoods" [multiple]="true">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutFormsMultiple {
    selectedFoods: string[];

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'select-with-custom-trigger',
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [formControl]="control" #select="mcTreeSelect">
                <mc-tree-select-trigger>
                    {{ select.triggerValue?.split('').reverse().join('') }}
                </mc-tree-select-trigger>
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SelectWithCustomTrigger {
    control = new FormControl();

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    selector: 'ng-model-compare-with',
    template: `
        <mc-form-field>
            <mc-tree-select
                [ngModel]="selected"
                (ngModelChange)="setFoodByCopy($event)"
                [compareWith]="comparator">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class NgModelCompareWithSelect {
    selected: { name: string; type: string } = { name: 'rootNode_1', type: 'app' };
    comparator: ((f1: any, f2: any) => boolean) | null;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.useCompareByValue();
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    useCompareByValue() {
        this.comparator = this.compareByValue;
    }

    useCompareByReference() {
        this.comparator = this.compareByReference;
    }

    useNullComparator() {
        this.comparator = null;
    }

    compareByValue(f1: any, f2: any) {
        return f1 && f2 && f1.value === f2.value;
    }

    compareByReference(f1: any, f2: any) {
        return f1 === f2;
    }

    setFoodByCopy(newValue: { name: string; type: string }) {
        this.selected = { ...{}, ...newValue };
    }
}

@Component({
    template: `
        <mc-tree-select placeholder="Food" [formControl]="control" [errorStateMatcher]="errorStateMatcher">
            <mc-tree-selection
                [dataSource]="dataSource"
                [treeControl]="treeControl">

                <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                    {{ treeControl.getViewValue(node) }}
                </mc-tree-option>

                <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                    <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                    {{ treeControl.getViewValue(node) }}
                </mc-tree-option>
            </mc-tree-selection>
        </mc-tree-select>
    `
})
class CustomErrorBehaviorSelect {
    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;

    control = new FormControl();

    errorStateMatcher: ErrorStateMatcher;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select placeholder="Food" [(ngModel)]="selectedFood">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                        <i mc-icon="mc-angle-S_16" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SingleSelectWithPreselectedArrayValues {
    selectedFood: string | null;

    @ViewChild(McTreeSelect, {static: false}) select: McTreeSelect;
    @ViewChildren(McTreeOption) options: QueryList<McTreeOption>;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.selectedFood = 'Pictures';
        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        // file node as children.
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}

@Component({
    template: `
        <mc-form-field>
            <!--<mc-label>Select a thing</mc-label>-->

            <mc-tree-select [placeholder]="placeholder">
                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">

                    <mc-tree-option>A thing</mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class SelectWithFormFieldLabel {
    placeholder: string;

    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;
}

@Component({
    template: `
        <mc-form-field>
            <mc-tree-select
                [multiple]="true"
                [formControl]="control"
                (selectionChange)="onSelectionChange($event)"
            >

                <mc-tree-selection
                    [dataSource]="dataSource"
                    [treeControl]="treeControl">
                    <mc-tree-option
                        #option
                        *mcTreeNodeDef="let node"
                        mcTreeNodePadding>

                        <mc-pseudo-checkbox [state]="pseudoCheckboxState(option)"></mc-pseudo-checkbox>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>

                    <mc-tree-option
                        #option
                        *mcTreeNodeDef="let node; when: hasChild"
                        mcTreeNodePadding>

                        <mc-pseudo-checkbox [state]="pseudoCheckboxState(option)"></mc-pseudo-checkbox>
                        <i mc-icon="mc-angle-down-S_16" [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'" mcTreeNodeToggle></i>
                        {{ treeControl.getViewValue(node) }}
                    </mc-tree-option>
                </mc-tree-selection>
            </mc-tree-select>
        </mc-form-field>
    `
})
class ChildSelection {
    treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable, getValue, getValue);
    treeFlattener = new McTreeFlattener(transformer, getLevel, isExpandable, getChildren);

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    control = new FormControl(['Downloads', 'rootNode_1']);

    @ViewChild(McTreeSelect) select: McTreeSelect;

    constructor() {
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = buildFileTree(TREE_DATA, 0);
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

    private toggleChildren($event: McTreeSelectChange) {
        const valuesToChange: any = this.treeControl.getDescendants($event.value.data);
        if ($event.value.selected) {
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
}

describe('McTreeSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dir: { value: 'ltr' | 'rtl' };
    const scrolledSubject: Subject<any> = new Subject();
    let viewportRuler: ViewportRuler;

    /**
     * Configures the test module for McTreeSelect with the given declarations. This is broken out so
     * that we're only compiling the necessary test components for each test in order to speed up
     * overall test time.
     * @param declarations Components to declare for this block
     */
    function configureMcTreeSelectTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                McFormFieldModule,
                McTreeModule,
                McTreeSelectModule,
                McSelectModule,
                McInputModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule,
                McPseudoCheckboxModule
            ],
            declarations,
            providers: [
                { provide: Directionality, useFactory: () => dir = { value: 'ltr' } },
                { provide: ScrollDispatcher, useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable()
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(waitForAsync(() => {
            configureMcTreeSelectTestingModule([
                BasicTreeSelect,
                BasicEvents,
                MultiSelect,
                SelectWithFormFieldLabel,
                SelectWithChangeEvent
            ]);
        }));

        describe('accessibility', () => {
            describe('for select', () => {
                let fixture: ComponentFixture<BasicTreeSelect>;
                let select: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTreeSelect);
                    fixture.detectChanges();
                    fixture.detectChanges();
                    select = fixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                    tick(100);
                }));

                it('should set the tabindex of the select to 0 by default', fakeAsync(() => {
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should be able to override the tabindex', fakeAsync(() => {
                    fixture.componentInstance.tabIndexOverride = 3;
                    fixture.detectChanges();

                    expect(select.getAttribute('tabindex')).toBe('3');
                }));

                it('should set the tabindex of the select to -1 if disabled', fakeAsync(() => {
                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('-1');

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                xit('should select options via the UP/DOWN arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
                    expect(formControl.value).toBe(
                        options[0].value,
                        'Expected value from first option to have been set on the model.'
                    );

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
                    expect(formControl.value).toBe(
                        options[3].value,
                        'Expected value from fourth option to have been set on the model.'
                    );

                    dispatchKeyboardEvent(select, 'keydown', UP_ARROW);

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(
                        options[1].value,
                        'Expected value from second option to have been set on the model.'
                    );
                }));

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    fixture.componentInstance.select.open();
                    fixture.detectChanges();
                    flush();

                    const optionToClick = overlayContainerElement.querySelectorAll('mc-tree-option')[2] as HTMLElement;
                    optionToClick.click();
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[2].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);
                    fixture.detectChanges();

                    expect(formControl.value).toBe(options[4].value);
                }));

                xit('should select options via LEFT/RIGHT arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
                    expect(formControl.value).toBe(
                        options[0].value,
                        'Expected value from first option to have been set on the model.'
                    );

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
                    expect(formControl.value).toBe(
                        options[3].value,
                        'Expected value from fourth option to have been set on the model.'
                    );

                    dispatchKeyboardEvent(select, 'keydown', LEFT_ARROW);

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(
                        options[1].value,
                        'Expected value from second option to have been set on the model.'
                    );
                }));

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');
                    expect(formControl.value).toBeFalsy('Expected value not to have changed.');
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');
                    expect(formControl.value).toBeFalsy('Expected value not to have changed.');
                }));

                it('should close when pressing ALT + DOWN_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(event.defaultPrevented).toBe(true, 'Expected default action to be prevented.');
                }));

                it('should close when pressing ALT + UP_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(event.defaultPrevented).toBe(true, 'Expected default action to be prevented.');
                }));

                xit('should be able to select options by typing on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(200);

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(
                        options[1].value,
                        'Expected value from second option to have been set on the model.'
                    );

                    dispatchEvent(select, createKeyboardEvent('keydown', 69, undefined, 'e'));
                    tick(200);

                    expect(options[5].selected).toBe(true, 'Expected sixth option to be selected.');
                    expect(formControl.value).toBe(
                        options[5].value,
                        'Expected value from sixth option to have been set on the model.'
                    );
                }));

                it(
                    'should open the panel when pressing a vertical arrow key on a closed multiple select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        multiFixture.detectChanges();

                        select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                        const initialValue = instance.control.value;

                        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                        const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        tick(10);

                        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
                        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
                    })
                );

                it(
                    'should open the panel when pressing a horizontal arrow key on closed multiple select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                        const initialValue = instance.control.value;

                        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                        const event = dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                        tick(10);

                        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
                        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
                    })
                );

                it('should do nothing when typing on a closed multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(10);

                    expect(instance.select.panelOpen).toBe(false, 'Expected panel to stay closed.');
                    expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                }));

                it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    expect(formControl.value).toBeNull('Expected form control value to be empty.');
                    expect(formControl.pristine).toBe(true, 'Expected form control to be clean.');

                    dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.
                    flush();

                    expect(formControl.value).toBeNull('Expected form control value to stay empty.');
                    expect(formControl.pristine).toBe(true, 'Expected form control to stay clean.');
                }));

                it(
                    'should continue from the selected option when the value is set programmatically',
                    fakeAsync(() => {
                        const formControl = fixture.componentInstance.control;

                        formControl.setValue('Pictures');

                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        tick(10);

                        expect(formControl.value).toBe('Documents');
                        expect(fixture.componentInstance.select.tree.keyManager.activeItem!.value)
                            .toBe('Documents');
                    })
                );

                it(
                    'should focus preselected option when select is being opened',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        multiFixture.detectChanges();

                        multiFixture.componentInstance.control.setValue(['Applications']);

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        tick(10);

                        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');
                        expect(document.activeElement).toBe(options[4]);
                    })
                );

                it(
                    'should not shift focus when the selected options are updated programmatically in a multi select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        multiFixture.detectChanges();
                        multiFixture.detectChanges();

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

                        options[2].focus();
                        expect(document.activeElement).toBe(options[2], 'Expected third option to be focused.');

                        multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);
                        tick(10);

                        expect(document.activeElement)
                            .toBe(options[2], 'Expected fourth option to remain focused.');
                    })
                );

                it('should not cycle through the options if the control is disabled', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');
                    formControl.disable();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(formControl.value).toBe('eggs-5', 'Expected value to remain unchaged.');
                }));

                it('should not wrap selection after reaching the end of the options', fakeAsync(() => {
                    const lastOption = fixture.componentInstance.options.last;

                    fixture.componentInstance.options.forEach(() => {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        tick(10);
                    });

                    expect(lastOption.selected).toBe(true, 'Expected last option to be selected.');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(lastOption.selected).toBe(true, 'Expected last option to stay selected.');
                }));

                it('should not open a multiple select when tabbing through', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .toBe(false, 'Expected panel to be closed initially.');

                    dispatchKeyboardEvent(select, 'keydown', TAB);
                    tick(10);

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .toBe(false, 'Expected panel to stay closed.');
                }));

                xit('should toggle the next option when pressing shift + DOWN_ARROW on a multi-select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);

                        const event = createKeyboardEvent('keydown', DOWN_ARROW);
                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        // multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        expect(multiFixture.componentInstance.select.value).toBeFalsy();

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1']);

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1', 'tacos-2']);
                    }));

                xit('should toggle the previous option when pressing shift + UP_ARROW on a multi-select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const event = createKeyboardEvent('keydown', UP_ARROW);
                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        // Move focus down first.
                        for (let i = 0; i < 5; i++) {
                            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                            multiFixture.detectChanges();
                        }

                        expect(multiFixture.componentInstance.select.value).toBeFalsy();

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['chips-4']);

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['sandwich-3', 'chips-4']);
                    }));

                it('should prevent the default action when pressing space', fakeAsync(() => {
                    const event = dispatchKeyboardEvent(select, 'keydown', SPACE);
                    flush();

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should consider the selection a result of a user action when closed', fakeAsync(() => {
                    const option = fixture.componentInstance.options.first;
                    const spy = jasmine.createSpy('option selection spy');
                    const subscription =
                        option.onSelectionChange.pipe(map((e) => e.isUserInput)).subscribe(spy);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    tick(10);

                    expect(spy).toHaveBeenCalledWith(true);

                    subscription.unsubscribe();
                }));

                it('should be able to focus the select trigger', fakeAsync(() => {
                    document.body.focus(); // ensure that focus isn't on the trigger already

                    fixture.componentInstance.select.focus();

                    expect(document.activeElement).toBe(select, 'Expected select element to be focused.');
                }));

                // todo тех долг
                xit('should restore focus to the trigger after selecting an option in multi-select mode',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        flush();

                        select = multiFixture.debugElement.query(By.css('mc-tree-select')).nativeElement;
                        instance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        // Ensure that the select isn't focused to begin with.
                        select.blur();
                        tick(10);
                        expect(document.activeElement).not.toBe(select, 'Expected trigger not to be focused.');

                        const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                        option.click();
                        tick(10);

                        expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');
                    }));
            });

            describe('for options', () => {
                let fixture: ComponentFixture<BasicTreeSelect>;
                let trigger: HTMLElement;
                let options: NodeListOf<HTMLElement>;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTreeSelect);
                    fixture.detectChanges();
                    fixture.detectChanges();

                    trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    options = overlayContainerElement.querySelectorAll('mc-tree-option');
                }));

                it('should set the tabindex of each option according to disabled state', fakeAsync(() => {
                    expect(options[0].getAttribute('tabindex')).toEqual('-1');
                    expect(options[3].getAttribute('tabindex')).toEqual('-1');
                }));
            });
        });

        describe('overlay panel', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should not throw when attempting to open too early', () => {
                // Create component and then immediately open without running change detection
                fixture = TestBed.createComponent(BasicTreeSelect);
                expect(() => fixture.componentInstance.select.open()).not.toThrow();
            });

            it('should open the panel when trigger is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(overlayContainerElement.textContent).toContain('rootNode_1');
                expect(overlayContainerElement.textContent).toContain('Pictures');
                expect(overlayContainerElement.textContent).toContain('Documents');
            }));

            it('should close the panel when an item is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when a click occurs outside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));

            it('should not attempt to open a select that does not have any options', fakeAsync(() => {
                fixture.componentInstance.dataSource.data = [];
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when tabbing out', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should restore focus to the host before tabbing away', fakeAsync(() => {
                const select = fixture.nativeElement.querySelector('.mc-tree-select');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                // Use a spy since focus can be flaky in unit tests.
                spyOn(select, 'focus').and.callThrough();

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(select.focus).toHaveBeenCalled();
            }));

            it('should close when tabbing out from inside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const panel = overlayContainerElement.querySelector('.mc-tree-select__panel')!;
                dispatchKeyboardEvent(panel, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should focus the first option when pressing HOME', fakeAsync(() => {
                fixture.componentInstance.control.setValue('Applications');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(0);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should focus the last option when pressing END', fakeAsync(() => {
                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(4);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to set extra classes on the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const panel = overlayContainerElement.querySelector('.mc-tree-select__panel') as HTMLElement;

                expect(panel.classList).toContain('custom-one');
                expect(panel.classList).toContain('custom-two');
            }));

            it('should prevent the default action when pressing SPACE on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.focus();
                const event = dispatchKeyboardEvent(option, 'keydown', SPACE);
                tick(10);

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should prevent the default action when pressing ENTER on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.focus();
                const event = dispatchKeyboardEvent(option, 'keydown', ENTER);
                tick(10);

                expect(event.defaultPrevented).toBe(true);
            }));

            it(
                'should not consider itself as blurred if the trigger loses focus while the panel is still open',
                fakeAsync(() => {
                    const selectElement = fixture.nativeElement.querySelector('.mc-tree-select');
                    const selectInstance = fixture.componentInstance.select;

                    dispatchFakeEvent(selectElement, 'focus');
                    fixture.detectChanges();

                    /* tslint:disable-next-line:deprecation */
                    expect(selectInstance.focused).toBe(true, 'Expected select to be focused.');

                    selectInstance.open();
                    fixture.detectChanges();
                    flush();
                    dispatchFakeEvent(selectElement, 'blur');
                    fixture.detectChanges();
                    tick(10);

                    /* tslint:disable-next-line:deprecation */
                    expect(selectInstance.focused).toBe(true, 'Expected select element to remain focused.');
                })
            );
        });

        describe('selection logic', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should not focus the first option if no option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toEqual(-1);
            }));

            it('should select an option when it is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;

                fixture.autoDetectChanges();
                expect(option.classList).toContain('mc-selected');
                expect(fixture.componentInstance.options.first.selected).toBe(true);
                expect(fixture.componentInstance.select.selectedValues)
                    .toBe(fixture.componentInstance.options.first.value);
            }));

            xit('should be able to select an option using the McTreeOption API', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const optionInstances = fixture.componentInstance.options.toArray();
                const optionNodes: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

                optionInstances[1].select();
                fixture.detectChanges();
                flush();

                expect(optionNodes[1].classList).toContain('mc-selected');
                expect(optionInstances[1].selected).toBe(true);
                expect(fixture.componentInstance.select.selected).toBe(optionInstances[1]);
            }));

            it('should deselect other options when one is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                tick(10);

                options = overlayContainerElement.querySelectorAll('mc-tree-option');
                expect(options[1].classList).not.toContain('mc-selected');
                expect(options[2].classList).not.toContain('mc-selected');

                const optionInstances = fixture.componentInstance.options.toArray();
                expect(optionInstances[1].selected).toBe(false);
                expect(optionInstances[2].selected).toBe(false);
            }));

            it('should deselect other options when one is programmatically selected', fakeAsync(() => {
                const control = fixture.componentInstance.control;
                const treeOptions = fixture.componentInstance.dataSource.data;

                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                control.setValue(treeOptions[1].name);
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('mc-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList)
                    .not.toContain('mc-selected', 'Expected first option to no longer be selected');
                expect(options[1].classList)
                    .toContain('mc-selected', 'Expected second option to be selected');

                const optionInstances = fixture.componentInstance.options.toArray();

                expect(optionInstances[0].selected)
                    .toBe(false, 'Expected first option to no longer be selected');
                expect(optionInstances[1].selected)
                    .toBe(true, 'Expected second option to be selected');
            }));

            xit('should remove selection if option has been removed', fakeAsync(() => {
                const select = fixture.componentInstance.select;

                trigger.click();
                fixture.detectChanges();
                flush();

                const firstOption = overlayContainerElement.querySelectorAll('mc-tree-option')[0] as HTMLElement;

                firstOption.click();
                fixture.detectChanges();

                expect(select.selected).toBe(select.options.first, 'Expected first option to be selected.');

                fixture.componentInstance.dataSource.data = [];
                fixture.detectChanges();
                flush();

                // todo не очищается селект
                expect(select.selected)
                    .toBeUndefined('Expected selection to be removed when option no longer exists.');
            }));

            it('should display the selected option in the trigger', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                const value = fixture.debugElement.query(By.css('.mc-tree-select__matcher')).nativeElement;

                expect(value.textContent).toContain('rootNode_1');
            }));

            it('should focus the selected option if an option is selected', fakeAsync(() => {
                // must wait for initial writeValue promise to finish
                flush();

                fixture.componentInstance.control.setValue('Pictures');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                // must wait for animation to finish
                fixture.detectChanges();
                expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toEqual(1);
            }));

            xit('should select an option that was added after initialization', fakeAsync(() => {
                // fixture.componentInstance.dataSource.data.push({ name: 'Potatoes', type: 'app' });
                trigger.click();
                fixture.detectChanges();
                flush();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll(
                    'mc-tree-option'
                );
                options[8].click();
                fixture.detectChanges();
                flush();

                expect(trigger.textContent).toContain('Potatoes');
                expect(fixture.componentInstance.select.selected)
                    .toBe(fixture.componentInstance.options.last);
            }));

            xit('should update the trigger when the selected option label is changed', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(trigger.querySelector('.mc-tree-select__matcher-text')!.textContent!.trim())
                    .toBe('Pizza');

                fixture.componentInstance.dataSource.data[1].name = 'Calzone';
                fixture.detectChanges();
                flush();

                expect(trigger.querySelector('.mc-tree-select__matcher-text')!.textContent!.trim())
                    .toBe('Calzone');
            }));

            it('should not select disabled options', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');
                options[3].click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[2].classList).not.toContain('mc-selected');
                expect(fixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not throw if triggerValue accessed with no selected value', fakeAsync(() => {
                expect(() => fixture.componentInstance.select.triggerValue).not.toThrow();
            }));

            xit('should emit to `optionSelectionChanges` when an option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const spy = jasmine.createSpy('option selection spy');
                const subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(McTreeSelectionChange));

                subscription.unsubscribe();
            }));

            xit('should handle accessing `optionSelectionChanges` before the options are initialized',
                fakeAsync(() => {
                    fixture.destroy();
                    fixture = TestBed.createComponent(BasicTreeSelect);

                    const spy = jasmine.createSpy('option selection spy');
                    let subscription: Subscription;

                    expect(fixture.componentInstance.select.options).toBeFalsy();
                    expect(() => {
                        subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                    }).not.toThrow();

                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    expect(spy).toHaveBeenCalledWith(jasmine.any(McTreeSelectionChange));

                    /* tslint:disable-next-line:no-unnecessary-type-assertion */
                    subscription!.unsubscribe();
                }));
        });

        describe('forms integration', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should take an initial view value with reactive forms', fakeAsync(() => {
                fixture.componentInstance.control = new FormControl('rootNode_1');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
                expect(value.nativeElement.textContent)
                    .toContain('rootNode_1', `Expected trigger to be populated by the control's initial value.`);

                trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('mc-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList)
                    .toContain(
                        'mc-selected',
                        `Expected option with the control's initial value to be selected.`
                    );
            }));

            it('should set the view value from the form', fakeAsync(() => {
                let value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
                expect(value.nativeElement.textContent.trim()).toBe('Food');

                fixture.componentInstance.control.setValue('rootNode_1');
                fixture.detectChanges();

                value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
                expect(value.nativeElement.textContent)
                    .toContain('rootNode_1', `Expected trigger to be populated by the control's new value.`);

                trigger.click();
                fixture.detectChanges();
                tick(1);
                flush();

                const options = overlayContainerElement.querySelectorAll('mc-tree-option');

                fixture.autoDetectChanges();

                expect(options[0].classList).toContain(
                    'mc-selected', `Expected option with the control's new value to be selected.`);
            }));

            it('should update the form value when the view changes', fakeAsync(() => {
                expect(fixture.componentInstance.control.value)
                    .toEqual(null, `Expected the control's value to be empty initially.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.value)
                    .toEqual('rootNode_1', `Expected control's value to be set to the new option.`);
            }));

            // todo сейчас логика позволяет устанавливать несуществующие значения
            xit('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.setValue('gibberish');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .toBe('Food', `Expected trigger to show the placeholder.`);
                expect(trigger.textContent)
                    .not.toContain('Pizza', `Expected trigger is cleared when option value is not found.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-tree-option');
                expect(options[1].classList)
                    .not.toContain('mc-selected', `Expected option w/ the old value not to be selected.`);
            }));


            it('should clear the selection when the control is reset', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .toBe('Food', `Expected trigger to show the placeholder.`);
                expect(trigger.textContent)
                    .not.toContain('Pizza', `Expected trigger is cleared when option value is not found.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-tree-option');
                expect(options[1].classList)
                    .not.toContain('mc-selected', `Expected option w/ the old value not to be selected.`);
            }));

            it('should set the control to touched when the select is blurred', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toEqual(false, `Expected the control to start off as untouched.`);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toEqual(false, `Expected the control to stay untouched when menu opened.`);

                document.body.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toEqual(true, `Expected the control to be touched as soon as focus left the select.`);
            }));

            it('should set the control to touched when the panel is closed', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to stay untouched when dropdown opened.');

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toBe(true, 'Expected the control to be touched when the panel was closed.');
            }));

            it('should not set touched when a disabled select is touched', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                fixture.componentInstance.control.disable();
                dispatchFakeEvent(trigger, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to stay untouched.');
            }));

            it('should set the control to dirty when the select value changes in DOM', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .toEqual(false, `Expected control to start out pristine.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick(1);
                flush();

                expect(fixture.componentInstance.control.dirty)
                    .toEqual(true, `Expected control to be dirty after value was changed by user.`);
            }));

            xit('should not set the control to dirty when the value changes programmatically',
                fakeAsync(() => {
                    expect(fixture.componentInstance.control.dirty)
                        .toEqual(false, `Expected control to start out pristine.`);

                    fixture.componentInstance.control.setValue('pizza-1');

                    expect(fixture.componentInstance.control.dirty)
                        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
                }));
        });

        describe('disabled behavior', () => {
            it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                const fixture = TestBed.createComponent(BasicTreeSelect);
                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .toEqual('', `Expected select panel to stay closed.`);
                expect(fixture.componentInstance.select.panelOpen)
                    .toBe(false, `Expected select panelOpen property to stay false.`);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .toContain('rootNode_1', `Expected select panel to open normally on re-enabled control`);
                expect(fixture.componentInstance.select.panelOpen)
                    .toBe(true, `Expected select panelOpen property to become true.`);
            }));
        });

        xdescribe('keyboard scrolling', () => {
            let fixture: ComponentFixture<BasicTreeSelect>;
            let host: HTMLElement;
            let panel: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicTreeSelect);

                fixture.detectChanges();
                fixture.componentInstance.select.open();
                fixture.detectChanges();
                flush();

                host = fixture.debugElement.query(By.css('mc-tree-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.mc-tree-select__panel') as HTMLElement;
            }));

            it('should not scroll to options that are completely in the view', fakeAsync(() => {
                const initialScrollPosition = panel.scrollTop;

                [1, 2, 3].forEach(() => {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                });

                expect(panel.scrollTop)
                    .toBe(initialScrollPosition, 'Expected scroll position not to change');
            }));

            it('should scroll down to the active option', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }

                // <option index * height> - <panel height> = 16 * 32 - 224 = 288
                expect(panel.scrollTop).toBe(288, 'Expected scroll to be at the 16th option.');
            }));

            it('should scroll up to the active option', fakeAsync(() => {
                // Scroll to the bottom.
                for (let i = 0; i < fixture.componentInstance.dataSource.data.length; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }

                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
                }

                // <option index * height> = 9 * 32 = 432
                expect(panel.scrollTop).toBe(288, 'Expected scroll to be at the 9th option.');
            }));

            it('should scroll top the top when pressing HOME', fakeAsync(() => {
                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                }

                expect(panel.scrollTop).toBeGreaterThan(0, 'Expected panel to be scrolled down.');

                dispatchKeyboardEvent(host, 'keydown', HOME);
                fixture.detectChanges();

                expect(panel.scrollTop).toBe(0, 'Expected panel to be scrolled to the top');
            }));

            it('should scroll to the bottom of the panel when pressing END', fakeAsync(() => {
                dispatchKeyboardEvent(host, 'keydown', END);
                fixture.detectChanges();

                // <option amount> * <option height> - <panel height> = 30 * 32 - 228 = 736
                expect(panel.scrollTop).toBe(732, 'Expected panel to be scrolled to the bottom');
            }));

            it('should scroll to the active option when typing', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    // Press the letter 'o' 15 times since all the options are named 'Option <index>'
                    dispatchEvent(host, createKeyboardEvent('keydown', 79, undefined, 'o'));
                    fixture.detectChanges();
                    tick(LETTER_KEY_DEBOUNCE_INTERVAL);
                }
                flush();

                // <option index * height> - <panel height> = 16 * 32 - 224 = 288
                expect(panel.scrollTop).toBe(288, 'Expected scroll to be at the 16th option.');
            }));

        });

        describe('Events', () => {
            let fixture: ComponentFixture<BasicEvents>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicEvents);
                fixture.detectChanges();
                fixture.detectChanges();

                trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

                tick(10);
            }));

            it('should fire openedChange event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();
            }));

            it('should fire openedChange event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalledTimes(2);
            }));

            it('should fire opened event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedListener).toHaveBeenCalled();
            }));

            it('should fire closed event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).toHaveBeenCalled();
            }));
        });
    });

    describe('when initialized without options', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([SelectInitWithoutOptions])));

        // todo fix
        xit('should select the proper option when option list is initialized later', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectInitWithoutOptions);
            const instance = fixture.componentInstance;
            const originalData = instance.dataSource.data;
            instance.dataSource.data = [];

            fixture.detectChanges();
            flush();

            // Wait for the initial writeValue promise.
            expect(instance.select.selected).toBeFalsy();

            instance.dataSource.data = originalData;
            fixture.detectChanges();
            flush();

            // Wait for the next writeValue promise.
            expect(instance.select.selected).toBe(instance.options.toArray()[0]);
        }));
    });

    describe('with a selectionChange event handler', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([SelectWithChangeEvent])));

        let fixture: ComponentFixture<SelectWithChangeEvent>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithChangeEvent);
            fixture.detectChanges();
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            tick(10);
        }));

        it('should emit an event when the selected option has changed', fakeAsync(() => {
            trigger.click();
            tick(0);
            fixture.detectChanges();

            (overlayContainerElement.querySelector('mc-tree-option') as HTMLElement).click();
            tick(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
        }));
        // todo эта проверка для ситуации когда нельзя снять выделение с элемента,
        // но для этого требуется реализация параметра noUnselect, поэтому пока этот TC добавлен в исключения.
        xit('should not emit multiple change events for the same option', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;

            option.click();
            option.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));

        it('should only emit one event when pressing arrow keys on closed select', fakeAsync(() => {
            const select = fixture.debugElement.query(By.css('mc-tree-select')).nativeElement;
            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));
    });

    describe('with ngModel', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([NgModelSelect])));

        it('should disable itself when control is disabled using the property', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgModelSelect);
            fixture.detectChanges();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            const trigger =
                fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

            trigger.click();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected select panel to stay closed.`);
            expect(fixture.componentInstance.select.panelOpen)
                .toBe(false, `Expected select panelOpen property to stay false.`);

            fixture.componentInstance.isDisabled = false;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.textContent)
                .toContain('rootNode_1', `Expected select panel to open normally on re-enabled control`);
            expect(fixture.componentInstance.select.panelOpen)
                .toBe(true, `Expected select panelOpen property to become true.`);
        }));
    });

    describe('with ngIf', () => {
        let fixture: ComponentFixture<NgIfSelect>;

        beforeEach(waitForAsync(() => {
            configureMcTreeSelectTestingModule([NgIfSelect]);

            fixture = TestBed.createComponent(NgIfSelect);
            fixture.detectChanges();
            fixture.detectChanges();
        }));

        it('should handle nesting in an ngIf', fakeAsync(() => {
            fixture.componentInstance.isShowing = true;
            fixture.detectChanges();
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            trigger.style.width = '300px';

            trigger.click();
            fixture.detectChanges();
            flush();

            const value = fixture.debugElement.query(By.css('.mc-tree-select__matcher'));
            expect(value.nativeElement.textContent)
                 .toContain('rootNode_1', `Expected trigger to be populated by the control's initial value.`);

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toEqual('300px');

            expect(fixture.componentInstance.select.panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('rootNode_1');
            expect(overlayContainerElement.textContent).toContain('Pictures');
            expect(overlayContainerElement.textContent).toContain('Documents');
        }));
    });

    describe('with search', () => {
        let fixture: ComponentFixture<SelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(waitForAsync(() => {
            configureMcTreeSelectTestingModule([SelectWithSearch]);

            fixture = TestBed.createComponent(SelectWithSearch);
            fixture.detectChanges();
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
        }));

        it('should have search input', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeDefined();
        }));

        it('should search filed should be focused after open', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input).toBe(document.activeElement);
        }));

        it('should show empty message', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'cgr8e912eha';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            flush();

            const options = fixture.debugElement.queryAll(By.css('mc-tree-option'));
            expect(options.length).toEqual(0);
            expect(fixture.debugElement.query(By.css('.mc-select__no-options-message'))).toBeDefined();
        }));

        it('should search', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'App';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            flush();

            const optionsTexts = fixture.debugElement.queryAll(By.css('mc-tree-option'))
                .map((el) => el.nativeElement.innerText);

            expect(optionsTexts).toEqual(['Applications', 'Chrome', 'Calendar', 'Webstorm']);
        }));

        it('should clear search by esc', (() => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'lu';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('');
        }));

        it('should close list by esc if input is empty', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            const selectInstance = fixture.componentInstance.select;

            expect(selectInstance.panelOpen).toBe(false);
        });
    });

    describe('with multiple mc-select elements in one view', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([ManySelects])));

        let fixture: ComponentFixture<ManySelects>;
        let triggers: DebugElement[];
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ManySelects);
            fixture.detectChanges();
            fixture.detectChanges();
            triggers = fixture.debugElement.queryAll(By.css('.mc-tree-select__trigger'));

            triggers[0].nativeElement.click();
            fixture.detectChanges();
            tick(10);

            flush();

            options = overlayContainerElement.querySelectorAll('mc-tree-option');
        }));

        it('should set the option id properly', fakeAsync(() => {
            const firstOptionID = options[0].id;

            expect(options[0].id)
                .toContain('mc-tree-option', `Expected option ID to have the correct prefix.`);
            expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);

            document.body.click();
            fixture.detectChanges();
            flush();

            triggers[1].nativeElement.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('mc-tree-option');
            expect(options[0].id)
                .toContain('mc-tree-option', `Expected option ID to have the correct prefix.`);
            expect(options[0].id).not.toEqual(firstOptionID, `Expected option IDs to be unique.`);
            expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);
        }));
    });

    describe('with a sibling component that throws an error', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([
            SelectWithErrorSibling,
            ThrowsErrorOnInit
        ])));

        it('should not crash the browser when a sibling throws an error on init', fakeAsync(() => {
            // Note that this test can be considered successful if the error being thrown didn't
            // end up crashing the testing setup altogether.
            expect(() => {
                TestBed.createComponent(SelectWithErrorSibling).detectChanges();
            }).toThrowError(new RegExp('Oh no!', 'g'));
        }));
    });

    describe('change events', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([EmptySelect])));

        it('should complete the stateChanges stream on destroy', () => {
            const fixture = TestBed.createComponent(EmptySelect);
            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(McTreeSelect));
            const select = debugElement.componentInstance;

            const spy = jasmine.createSpy('stateChanges complete');
            const subscription = select.stateChanges.subscribe(undefined, undefined, spy);

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });
    });

    describe('when initially hidden', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([BasicSelectInitiallyHidden])));

        it('should set the width of the overlay if the element was hidden initially', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectInitiallyHidden);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.style.width = '200px';
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toBe('200px');
        }));
    });

    describe('with no placeholder', () => {
        let fixture: ComponentFixture<BasicSelectNoPlaceholder>;

        beforeEach(waitForAsync(() => {
            configureMcTreeSelectTestingModule([BasicSelectNoPlaceholder]);

            fixture = TestBed.createComponent(BasicSelectNoPlaceholder);
            fixture.detectChanges();
        }));

        it('should set the width of the overlay if there is no placeholder', fakeAsync(() => {
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(parseInt(pane.style.minWidth as string)).toBeGreaterThan(0);
        }));
    });

    describe('with theming', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([BasicSelectWithTheming])));

        let fixture: ComponentFixture<BasicSelectWithTheming>;

        beforeEach(() => {
            fixture = TestBed.createComponent(BasicSelectWithTheming);
            fixture.detectChanges();

        });

        it('should transfer the theme to the select panel', () => {
            fixture.componentInstance.theme = 'error';
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            trigger.click();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.mc-tree-select__panel')!;
            expect(panel.classList).toContain('mc-error');
        });
    });

    describe('when invalid inside a form', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([InvalidSelectInForm])));

        it('should not throw SelectionModel errors in addition to ngModel errors', fakeAsync(() => {
            const fixture = TestBed.createComponent(InvalidSelectInForm);

            // The first change detection run will throw the "ngModel is missing a name" error.
            expect(() => fixture.detectChanges()).toThrowError(/the name attribute must be set/g);

            // The second run shouldn't throw selection-model related errors.
            expect(() => fixture.detectChanges()).not.toThrow();
        }));
    });

    // todo fix
    xdescribe('with ngModel using compareWith', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([NgModelCompareWithSelect])));

        let fixture: ComponentFixture<NgModelCompareWithSelect>;
        let instance: NgModelCompareWithSelect;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NgModelCompareWithSelect);
            instance = fixture.componentInstance;
            fixture.detectChanges();
        }));

        describe('comparing by value', () => {

            xit('should have a selection', fakeAsync(() => {
                const selectedOption = instance.select.selected as McTreeOption;
                expect(selectedOption.value).toEqual('rootNode_1');
            }));

            xit('should update when making a new selection', fakeAsync(() => {
                const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();

                instance.options.last.selectViaInteraction();
                fixture.detectChanges();
                flush();

                const selectedOption = instance.select.selected as McTreeOption;
                expect(instance.selected.name).toEqual('tacos-2');
                expect(selectedOption.value).toEqual('tacos-2');
            }));
        });

        describe('comparing by reference', () => {
            beforeEach(fakeAsync(() => {
                spyOn(instance, 'compareByReference').and.callThrough();
                instance.useCompareByReference();
                fixture.detectChanges();
                flush();
            }));

            it('should use the comparator', fakeAsync(() => {
                expect(instance.compareByReference).toHaveBeenCalled();
            }));

            it('should initialize with no selection despite having a value', fakeAsync(() => {
                expect(instance.selected.name).toBe('rootNode_1');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should not update the selection if value is copied on change', fakeAsync(() => {
                instance.options.first.selectViaInteraction();
                fixture.detectChanges();
                flush();

                expect(instance.selected.name).toEqual('steak-0');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should throw an error when using a non-function comparator', fakeAsync(() => {
                instance.useNullComparator();

                expect(() => { fixture.detectChanges(); }).toThrowError(
                    wrappedErrorMessage(getMcSelectNonFunctionValueError())
                );
            }));
        });
    });


    describe(`when the select's value is accessed on initialization`, () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([SelectEarlyAccessSibling])));

        it('should not throw when trying to access the selected value on init', fakeAsync(() => {
            expect(() => { TestBed.createComponent(SelectEarlyAccessSibling).detectChanges(); }).not.toThrow();
        }));
    });

    describe('inside of a form group', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([SelectInsideFormGroup])));

        let fixture: ComponentFixture<SelectInsideFormGroup>;
        let testComponent: SelectInsideFormGroup;
        let select: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectInsideFormGroup);
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            select = fixture.debugElement.query(By.css('mc-tree-select')).nativeElement;

            tick(10);
        }));

        it('should not set the invalid class on a clean select', fakeAsync(() => {
            expect(testComponent.formGroup.untouched).toBe(true, 'Expected the form to be untouched.');
            expect(testComponent.formControl.invalid).toBe(false, 'Expected form control to be invalid.');
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');
        }));

        it('should not appear as invalid if it becomes touched', fakeAsync(() => {
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');

            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select to appear invalid.');
        }));

        it('should not have the invalid class when the select becomes valid', fakeAsync(() => {
            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select to appear invalid.');

            testComponent.formControl.setValue('pizza-1');
            fixture.detectChanges();
            flush();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');
        }));

        it('should appear as invalid when the parent form group is submitted', fakeAsync(() => {
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(select.classList)
                .toContain('mc-invalid', 'Expected select to appear invalid.');
        }));

        // todo fix
        xit('should render the error messages when the parent form is submitted', fakeAsync(() => {
            const debugEl = fixture.debugElement.nativeElement;

            expect(debugEl.querySelectorAll('mc-error').length).toBe(0, 'Expected no error messages');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(debugEl.querySelectorAll('mc-error').length).toBe(1, 'Expected one error message');
        }));

        it('should override error matching behavior via injection token', fakeAsync(() => {
            const errorStateMatcher: ErrorStateMatcher = {
                isErrorState: jasmine.createSpy('error state matcher').and.returnValue(true)
            };

            fixture.destroy();

            TestBed.resetTestingModule().configureTestingModule({
                imports: [
                    McFormFieldModule,
                    McTreeModule,
                    McTreeSelectModule,
                    ReactiveFormsModule,
                    FormsModule,
                    NoopAnimationsModule
                ],
                declarations: [SelectInsideFormGroup],
                providers: [{ provide: ErrorStateMatcher, useValue: errorStateMatcher }]
            });

            const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
            const component = errorFixture.componentInstance;

            errorFixture.detectChanges();

            tick(10);

            expect(component.select.errorState).toBe(true);
            expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
        }));
    });

    describe('with custom error behavior', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([CustomErrorBehaviorSelect])));

        it('should be able to override the error matching behavior via an @Input', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomErrorBehaviorSelect);
            const component = fixture.componentInstance;
            const matcher = jasmine.createSpy('error state matcher').and.returnValue(true);

            fixture.detectChanges();

            expect(component.control.invalid).toBe(false);
            expect(component.select.errorState).toBe(false);

            fixture.componentInstance.errorStateMatcher = { isErrorState: matcher };
            fixture.detectChanges();
            tick(10);

            expect(component.select.errorState).toBe(true);
            expect(matcher).toHaveBeenCalled();
        }));
    });

    describe('with preselected array values', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([
            SingleSelectWithPreselectedArrayValues
        ])));

        it('should be able to preselect an array value in single-selection mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectWithPreselectedArrayValues);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            fixture.detectChanges();
            tick(600);

            expect(trigger.textContent).toContain('Pictures');
            // expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
        }));
    });

    describe('with custom value accessor', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([
            CompWithCustomSelect,
            CustomSelectAccessor
        ])));

        it('should support use inside a custom value accessor', fakeAsync(() => {
            const fixture = TestBed.createComponent(CompWithCustomSelect);
            spyOn(fixture.componentInstance.customAccessor, 'writeValue');
            fixture.detectChanges();

            expect(fixture.componentInstance.customAccessor.select.ngControl)
                .toBeFalsy('Expected mc-select NOT to inherit control from parent value accessor.');
            expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
        }));
    });

    // todo оставлено как тех долг
    xdescribe('with a falsy value', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([FalsyValueSelect])));

        it('should be able to programmatically select a falsy option', fakeAsync(() => {
            const fixture = TestBed.createComponent(FalsyValueSelect);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement.click();
            fixture.componentInstance.control.setValue(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.options.first.selected)
                .toBe(true, 'Expected first option to be selected');
            expect(overlayContainerElement.querySelectorAll('mc-tree-option')[0].classList)
                .toContain('mc-selected', 'Expected first option to be selected');
        }));
    });

    describe('with OnPush', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([
            BasicSelectOnPush,
            BasicSelectOnPushPreselected
        ])));

        it('should set the trigger text based on the value when initialized', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPushPreselected);
            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            fixture.detectChanges();

            expect(trigger.textContent).toContain('rootNode_1');
        }));

        it('should update the trigger based on the value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPush);
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            fixture.componentInstance.control.setValue('rootNode_1');
            fixture.detectChanges();
            flush();

            expect(trigger.textContent).toContain('rootNode_1');

            fixture.componentInstance.control.reset();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(trigger.textContent).not.toContain('Pizza');
        }));
    });

    describe('with custom trigger', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([SelectWithCustomTrigger])));

        it('should allow the user to customize the label', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomTrigger);
            fixture.detectChanges();

            fixture.componentInstance.control.setValue('Downloads');
            fixture.detectChanges();
            tick(1);
            flush();

            const label = fixture.debugElement.query(By.css('.mc-tree-select__matcher')).nativeElement;

            expect(label.textContent).toContain(
                'sdaolnwoD',
                'Expected the displayed text to be "Pizza" in reverse.'
            );
        }));
    });

    describe('when resetting the value by setting null or undefined', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([ResetValuesSelect])));

        let fixture: ComponentFixture<ResetValuesSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ResetValuesSelect);
            fixture.autoDetectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('.mc-form-field')).nativeElement;

            trigger.click();

            options = overlayContainerElement.querySelectorAll('mc-tree-option');
            options[1].click();
            tick(1);
        }));

        xit('should reset when an option with an undefined value is selected', fakeAsync(() => {
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('Undefined-option');
        }));

        it('should reset when an option with a null value is selected', fakeAsync(() => {
            fixture.componentInstance.control.setValue(null);
            options[2].click();
            tick(1);

            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('Null-option');
        }));

        // todo fix ?
        xit('should reset when a blank option is selected', fakeAsync(() => {
            options[6].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('None');
        }));

        it('should not mark the reset option as selected ', fakeAsync(() => {
            options[4].click();

            fixture.componentInstance.select.open();
            tick(1);

            expect(options[4].classList).not.toContain('mc-selected');
        }));

        // todo fix
        xit('should not reset when any other falsy option is selected', fakeAsync(() => {
            options[3].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBe(false);
            expect(fixture.componentInstance.select.selected).toBeTruthy();
            expect(trigger.textContent).toContain('Falsy-option');
        }));

        it(
            'should not consider the reset values as selected when resetting the form control',
            fakeAsync(() => {
                fixture.componentInstance.control.reset();
                tick(1);

                expect(fixture.componentInstance.control.value).toBeUndefined();
                expect(fixture.componentInstance.select.selected).toBeFalsy();
                expect(trigger.textContent).not.toContain('Null');
                expect(trigger.textContent).not.toContain('Undefined-option');
            })
        );
    });

    describe('without Angular forms', () => {
        let fixture: ComponentFixture<BasicSelectWithoutForms>;

        beforeEach(waitForAsync(() => {
            configureMcTreeSelectTestingModule([
                BasicSelectWithoutForms,
                BasicSelectWithoutFormsPreselected,
                BasicSelectWithoutFormsMultiple
            ]);

            fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.detectChanges();
        }));

        it('should set the value when options are clicked', fakeAsync(() => {
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('rootNode_1');
            expect(fixture.componentInstance.select.value).toBe('rootNode_1');
            expect(trigger.textContent).toContain('rootNode_1');

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelectorAll('mc-tree-option')[2] as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('Documents');
            expect(fixture.componentInstance.select.value).toBe('Documents');
            expect(trigger.textContent).toContain('Documents');
        }));


        it('should mark options as selected when the value is set', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.componentInstance.selectedFood = 'rootNode_1';
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('rootNode_1');

            const option = overlayContainerElement.querySelectorAll('mc-tree-option')[0];

            expect(option.classList).toContain('mc-selected');
            // expect(fixture.componentInstance.select.value).toBe('sandwich-2');
        }));

        it('should reset the label when a null value is set', fakeAsync(() => {
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();

            (overlayContainerElement.querySelector('mc-tree-option') as HTMLElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFood).toBe('rootNode_1');
            expect(trigger.textContent).toContain('rootNode_1');

            fixture.componentInstance.selectedFood = null;
            fixture.detectChanges();
            tick(1);
            flush();

            expect(trigger.textContent).not.toContain('rootNode_1');
        }));


        it('should reflect the preselected value', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            fixture.detectChanges();
            tick(600);


            expect(trigger.textContent).toContain('Pictures');
            trigger.click();
            fixture.detectChanges();

            flush();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('mc-tree-option')[1];

            expect(option.classList).toContain('mc-selected');
            expect(fixture.componentInstance.select.value).toBe('Pictures');
        }));

        it('should be able to select multiple values', fakeAsync(() => {
            const localFixture = TestBed.createComponent(BasicSelectWithoutFormsMultiple);
            localFixture.detectChanges();
            localFixture.detectChanges();

            expect(localFixture.componentInstance.selectedFoods).toBeFalsy();

            const trigger = localFixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            trigger.click();
            localFixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[0].click();
            localFixture.detectChanges();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1']);
            expect(trigger.textContent).toContain('rootNode_1');

            options[2].click();
            localFixture.detectChanges();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1', 'Documents']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1', 'Documents']);
            expect(trigger.textContent).toContain('rootNode_1');
            expect(trigger.textContent).toContain('Documents');

            options[1].click();
            localFixture.detectChanges();
            flush();

            expect(localFixture.componentInstance.selectedFoods).toEqual(['rootNode_1', 'Documents', 'Pictures']);
            expect(localFixture.componentInstance.select.value).toEqual(['rootNode_1', 'Documents', 'Pictures']);
            expect(trigger.textContent).toContain('rootNode_1');
            expect(trigger.textContent).toContain('Pictures');
            expect(trigger.textContent).toContain('Documents');
        }));

        it('should restore focus to the host element', fakeAsync(() => {
            fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            const select = fixture.debugElement.nativeElement.querySelector('mc-tree-select');

            expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');
        }));

        // excluded because tree-select works not like select
        xit('should not restore focus to the host element when clicking outside', fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const select = fixture.debugElement.nativeElement.querySelector('mc-tree-select');

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');

            select.blur(); // Blur manually since the programmatic click might not do it.
            (overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).not.toBe(select, 'Expected trigger not to be focused.');
        }));

        it('should update the data binding before emitting the change event', fakeAsync(() => {
            const instance = fixture.componentInstance;
            const spy = jasmine.createSpy('change spy');

            fixture.detectChanges();
            instance.select.selectionChange.subscribe(() => spy(instance.selectedFood));

            expect(instance.selectedFood).toBeFalsy();

            fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-tree-option') as HTMLElement).click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(instance.selectedFood).toBe('rootNode_1');
            expect(spy).toHaveBeenCalledWith('rootNode_1');
        }));
    });

    describe('positioning', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([
            BasicTreeSelect,
            MultiSelect
        ])));

        beforeEach((inject([ViewportRuler], (vr: ViewportRuler) => {
            viewportRuler = vr;
        })));

        let fixture: ComponentFixture<BasicTreeSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicTreeSelect);
            fixture.detectChanges();
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('mc-form-field')).nativeElement;

            tick(10);
        }));

        /**
         * Asserts that the given option is aligned with the trigger.
         * @param index The index of the option.
         * @param selectInstance Instance of the `mc-select` component to check against.
         */
        function checkTriggerAlignedWithOption(index: number, selectInstance =
            fixture.componentInstance.select): void {

            const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const triggerTop: number = trigger.getBoundingClientRect().top;
            const overlayTop: number = overlayPane.getBoundingClientRect().top;
            const options: NodeListOf<HTMLElement> = overlayPane.querySelectorAll('mc-tree-option');
            const optionTop = options[index].getBoundingClientRect().top;
            const triggerFontSize = parseInt(window.getComputedStyle(trigger)['font-size']);
            const triggerLineHeightEm = 1.125;

            // Extra trigger height beyond the font size caused by the fact that the line-height is
            // greater than 1em.
            const triggerExtraLineSpaceAbove = (1 - triggerLineHeightEm) * triggerFontSize / 2;
            const topDifference = Math.floor(optionTop) -
                Math.floor(triggerTop - triggerFontSize - triggerExtraLineSpaceAbove);

            // Expect the coordinates to be within a pixel of each other. We can't rely on comparing
            // the exact value, because different browsers report the various sizes with slight (< 1px)
            // deviations.
            expect(Math.abs(topDifference) < 2)
                .toBe(true, `Expected trigger to align with option ${index}.`);

            // For the animation to start at the option's center, its origin must be the distance
            // from the top of the overlay to the option top + half the option height (48/2 = 24).
            const expectedOrigin = Math.floor(optionTop - overlayTop + 24);
            const rawYOrigin = selectInstance.transformOrigin.split(' ')[1].trim();
            const origin = Math.floor(parseInt(rawYOrigin));

            // Because the origin depends on the Y axis offset, we also have to
            // round down and check that the difference is within a pixel.
            expect(Math.abs(expectedOrigin - origin) < 2).toBe(
                true,
                `Expected panel animation to originate in the center of option ${index}.`
            );
        }

        describe('ample space to open', () => {
            beforeEach(fakeAsync(() => {
                // these styles are necessary because we are first testing the overlay's position
                // if there is room for it to open to its full extent in either direction.
                formField.style.position = 'fixed';
                formField.style.top = '285px';
                formField.style.left = '20px';
            }));

            xit('should align the first option with trigger text if no option is selected',
                fakeAsync(() => {
                    // We shouldn't push it too far down for this one, because the default may
                    // end up being too much when running the tests on mobile browsers.
                    formField.style.top = '100px';
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                    // The panel should be scrolled to 0 because centering the option is not possible.
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);
                    checkTriggerAlignedWithOption(0);
                }));

            xit('should align a selected option too high to be centered with the trigger text',
                fakeAsync(() => {
                    // Select the second option, because it can't be scrolled any further downward
                    fixture.componentInstance.control.setValue('pizza-1');
                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                    // The panel should be scrolled to 0 because centering the option is not possible.
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);
                    checkTriggerAlignedWithOption(1);
                }));

            xit('should align a selected option in the middle with the trigger text', fakeAsync(() => {
                // Select the fifth option, which has enough space to scroll to the center
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half
                // the option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
                // 192 - 256/2 + 48/2 = 88px
                expect(scrollContainer.scrollTop)
                    .toEqual(88, `Expected overlay panel to be scrolled to center the selected option.`);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should align a selected option at the scroll max with the trigger text', fakeAsync(() => {
                // Select the last option in the list
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                // The selected option should be scrolled to the max scroll position.
                // This will be the height of the scrollContainer - the panel height.
                // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
                expect(scrollContainer.scrollTop)
                    .toEqual(128, `Expected overlay panel to be scrolled to its maximum position.`);

                checkTriggerAlignedWithOption(7);
            }));
        });

        describe('limited space to open vertically', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '20px';
            }));

            xit('should adjust position of centered option if there is little space above',
                fakeAsync(() => {
                    const selectMenuHeight = 256;
                    const selectMenuViewportPadding = 8;
                    const selectItemHeight = 48;
                    const selectedIndex = 4;
                    const fontSize = 16;
                    const lineHeightEm = 1.125;
                    const expectedExtraScroll = 5;

                    // Trigger element height.
                    const triggerHeight = fontSize * lineHeightEm;

                    // Ideal space above selected item in order to center it.
                    const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                    // Actual space above selected item.
                    const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                    // Ideal scroll position to center.
                    const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                    // Top-most select-position that allows for perfect centering.
                    const topMostPositionForPerfectCentering =
                        idealSpaceAboveSelectedItem + selectMenuViewportPadding +
                        (selectItemHeight - triggerHeight) / 2;

                    // Position of select relative to top edge of mc-form-field.
                    const formFieldTopSpace =
                        trigger.getBoundingClientRect().top - formField.getBoundingClientRect().top;

                    const formFieldTop =
                        topMostPositionForPerfectCentering - formFieldTopSpace - expectedExtraScroll;

                    formField.style.top = `${formFieldTop}px`;

                    // Select an option in the middle of the list
                    fixture.componentInstance.control.setValue('chips-4');
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                    expect(Math.ceil(scrollContainer.scrollTop))
                        .toEqual(
                            Math.ceil(idealScrollTop + 5),
                            `Expected panel to adjust scroll position to fit in viewport.`
                        );

                    checkTriggerAlignedWithOption(4);
                }));

            xit('should adjust position of centered option if there is little space below',
                fakeAsync(() => {
                    const selectMenuHeight = 256;
                    const selectMenuViewportPadding = 8;
                    const selectItemHeight = 48;
                    const selectedIndex = 4;
                    const fontSize = 16;
                    const lineHeightEm = 1.125;
                    const expectedExtraScroll = 5;

                    // Trigger element height.
                    const triggerHeight = fontSize * lineHeightEm;

                    // Ideal space above selected item in order to center it.
                    const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                    // Actual space above selected item.
                    const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                    // Ideal scroll position to center.
                    const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                    // Bottom-most select-position that allows for perfect centering.
                    const bottomMostPositionForPerfectCentering =
                        idealSpaceAboveSelectedItem + selectMenuViewportPadding +
                        (selectItemHeight - triggerHeight) / 2;

                    // Position of select relative to bottom edge of mc-form-field:
                    const formFieldBottomSpace =
                        formField.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom;

                    const formFieldBottom =
                        bottomMostPositionForPerfectCentering - formFieldBottomSpace - expectedExtraScroll;

                    // Push the select to a position with not quite enough space on the bottom to open
                    // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
                    formField.style.bottom = `${formFieldBottom}px`;

                    // Select an option in the middle of the list
                    fixture.componentInstance.control.setValue('chips-4');
                    fixture.detectChanges();
                    flush();

                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-tree-select__panel')!;

                    // Scroll should adjust by the difference between the bottom space available
                    // (56px from the bottom of the screen - 8px padding = 48px)
                    // and the height of the panel below the option (113px).
                    // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
                    const difference = Math.ceil(scrollContainer.scrollTop) -
                        Math.ceil(idealScrollTop - expectedExtraScroll);

                    // Note that different browser/OS combinations report the different dimensions with
                    // slight deviations (< 1px). We round the expectation and check that the values
                    // are within a pixel of each other to avoid flakes.
                    expect(Math.abs(difference) < 2)
                        .toBe(true, `Expected panel to adjust scroll position to fit in viewport.`);

                    checkTriggerAlignedWithOption(4);
                }));

            xit('should fall back to "above" positioning if scroll adjustment will not help',
                fakeAsync(() => {
                    // Push the select to a position with not enough space on the bottom to open
                    formField.style.bottom = '56px';
                    fixture.detectChanges();

                    // Select an option that cannot be scrolled any farther upward
                    fixture.componentInstance.control.setValue('coke-0');
                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                    const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                    const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                    const scrollContainer = overlayPane.querySelector('.mc-tree-select__panel')!;

                    // Expect no scroll to be attempted
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

                    const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                    // Check that the values are within a pixel of each other. This avoids sub-pixel
                    // deviations between OS and browser versions.
                    expect(Math.abs(difference) < 2)
                        .toEqual(true, `Expected trigger bottom to align with overlay bottom.`);

                    expect(fixture.componentInstance.select.transformOrigin)
                        .toContain(`bottom`, `Expected panel animation to originate at the bottom.`);
                }));

            xit('should fall back to "below" positioning if scroll adjustment won\'t help',
                fakeAsync(() => {
                    // Push the select to a position with not enough space on the top to open
                    formField.style.top = '85px';

                    // Select an option that cannot be scrolled any farther downward
                    fixture.componentInstance.control.setValue('sushi-7');
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                    const triggerTop: number = trigger.getBoundingClientRect().top;
                    const overlayTop: number = overlayPane.getBoundingClientRect().top;
                    const scrollContainer = overlayPane.querySelector('.mc-tree-select__panel')!;

                    // Expect scroll to remain at the max scroll position
                    expect(scrollContainer.scrollTop)
                        .toEqual(128, `Expected panel to be at max scroll.`);

                    expect(Math.floor(overlayTop))
                        .toEqual(Math.floor(triggerTop), `Expected trigger top to align with overlay top.`);

                    expect(fixture.componentInstance.select.transformOrigin)
                        .toContain(`top`, `Expected panel animation to originate at the top.`);
                }));
        });

        describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));


            it('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThan(
                    0,
                    `Expected select panel to be inside the viewport in ltr.`
                    );
            }));

            it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThan(
                        0,
                        `Expected select panel to be inside the viewport in rtl.`
                    );
            }));

            it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
                formField.style.right = '-100px';
                trigger.click();
                tick(10);
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight)
                    .toBeGreaterThan(
                        0,
                        `Expected select panel to be inside the viewport in ltr.`
                    );
            }));

            xit('should stay within the viewport when overflowing on the right in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight)
                    .toBeGreaterThan(
                        0,
                        `Expected select panel to be inside the viewport in rtl.`
                    );
            }));


            it('should keep the position within the viewport on repeat openings', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                let panelLeft = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThanOrEqual(0, `Expected select panel to be inside the viewport.`);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                panelLeft = document.querySelector('.mc-tree-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThanOrEqual(
                        0,
                        `Expected select panel continue being inside the viewport.`
                    );
            }));
        });
    });

    describe('with multiple selection', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([MultiSelect])));

        let fixture: ComponentFixture<MultiSelect>;
        let testInstance: MultiSelect;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiSelect);
            testInstance = fixture.componentInstance;
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            tick(10);
            fixture.detectChanges();
        }));

        it('should render checkboxes', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options.forEach((option) => {
                expect(option.querySelector('mc-pseudo-checkbox')).not.toBeNull();
            });

        }));

        it('should be able to select multiple values', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[0].click();
            options[2].click();
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual(['rootNode_1', 'Documents', 'Applications']);
        }));

        it('should be able to toggle an option on and off', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('mc-tree-option') as HTMLElement;

            option.click();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['rootNode_1']);

            option.click();
            fixture.detectChanges();
            tick(1);
            flush();

            expect(testInstance.control.value).toEqual([]);
        }));

        it('should update the label', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[0].click();
            options[2].click();
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('mc-tag'), (item) => item.textContent!.trim()))
                .toEqual(['rootNode_1', 'Documents', 'Applications']);

            options[2].click();
            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('mc-tag'), (item) => item.textContent!.trim()))
                .toEqual(['rootNode_1', 'Applications']);
        }));

        it('should be able to set the selected value by taking an array', fakeAsync(() => {

            trigger.click();
            testInstance.control.setValue(['rootNode_1', 'Applications']);
            fixture.detectChanges();
            flush();

            const optionNodes = overlayContainerElement.querySelectorAll('mc-tree-option');

            const optionInstances = testInstance.options.toArray();

            fixture.autoDetectChanges();
            expect(optionNodes[0].classList).toContain('mc-selected');
            expect(optionNodes[4].classList).toContain('mc-selected');

            expect(optionInstances[0].selected).toBe(true);
            expect(optionInstances[4].selected).toBe(true);
        }));

        it('should override the previously-selected value when setting an array', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            expect(options[0].classList).not.toContain('mc-selected');

            options[0].click();
            fixture.autoDetectChanges();
            flush();

            expect(options[0].classList).toContain('mc-selected');

            testInstance.control.setValue(['Applications']);
            fixture.detectChanges();
            flush();

            fixture.autoDetectChanges();
            expect(options[0].classList).not.toContain('mc-selected');
            expect(options[4].classList).toContain('mc-selected');
        }));

        it('should not close the panel when clicking on options', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[0].click();
            options[1].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);
        }));

        xit('should sort the selected options based on their order in the panel', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.querySelector('.mc-tree-select__match-list')!.textContent).toContain('Steak, Pizza, Tacos');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should sort the selected options in reverse in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should be able to customize the value sorting logic', fakeAsync(() => {
            // fixture.componentInstance.sortComparator = (a, b, optionsArray) => {
            //     return optionsArray.indexOf(b) - optionsArray.indexOf(a);
            // };
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            for (let i = 0; i < 3; i++) {
                options[i].click();
            }
            fixture.detectChanges();

            // Expect the items to be in reverse order.
            expect(trigger.querySelector('.mc-tree-select__match-list')!.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['tacos-2', 'pizza-1', 'steak-0']);
        }));

        xit('should sort the values that get set via the model based on the panel order',
            fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
                fixture.detectChanges();
                flush();

                // expect(trigger.querySelector('.mc-tree-select__match-list')!.textContent.trim())
                //     .toContain('Steak, Pizza, Tacos');
                expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
            }));

        xit('should reverse sort the values, that get set via the model in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
        }));

        it('should throw an exception when trying to set a non-array value', fakeAsync(() => {
            expect(() => {
                testInstance.control.setValue('not-an-array');
            }).toThrowError(wrappedErrorMessage(getMcSelectNonArrayValueError()));
        }));

        it('should throw an exception when trying to change multiple mode after init', fakeAsync(() => {
            expect(() => {
                testInstance.select.multiple = false;
            }).toThrowError(wrappedErrorMessage(getMcSelectDynamicMultipleError()));
        }));

        xit('should pass the `multiple` value to all of the option instances', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.options.toArray().every((option: any) => option.multiple))
                .toBe(
                    true,
                    'Expected `multiple` to have been added to initial set of options.'
                );

            // testInstance.dataSource.data.push({ name: 'cake-8', type: 'app' });
            fixture.detectChanges();

            expect(testInstance.options.toArray().every((option) => !!option.tree.multiple))
                .toBe(
                    true,
                    'Expected `multiple` to have been set on dynamically-added option.'
                );
        }));

        it('should update the active item index on click', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(-1);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[2].focus();
            options[2].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.select.tree.keyManager.activeItemIndex).toBe(2);
        }));

        xit('should be to select an option with a `null` value', fakeAsync(() => {
            fixture.detectChanges();
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');

            options[0].click();
            options[1].click();
            options[2].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual([null, 'pizza-1', null]);
        }));

        xit('should select all options when pressing ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-tree-select');
            const options = fixture.componentInstance.options.toArray();

            expect(testInstance.control.value).toBeFalsy();
            expect(options.every((option) => option.selected)).toBe(false);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should skip disabled options when using ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-tree-select');
            const options = fixture.componentInstance.options.toArray();

            for (let i = 0; i < 3; i++) {
                options[i].disabled = true;
            }

            expect(testInstance.control.value).toBeFalsy();

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should select all options when pressing ctrl + a when some options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-tree-select');
            const options = fixture.componentInstance.options.toArray();

            options[0].select();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);
            expect(options.some((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        xit('should deselect all options with ctrl + a if all options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-tree-select');
            const options = fixture.componentInstance.options.toArray();

            options.forEach((option) => option.select());
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
            expect(options.every((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.some((option) => option.selected)).toBe(false);
            expect(testInstance.control.value).toEqual([]);
        });
    });

    describe('with parent selection', () => {
        beforeEach(waitForAsync(() => configureMcTreeSelectTestingModule([ChildSelection])));

        let fixture: ComponentFixture<ChildSelection>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ChildSelection);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-tree-select__trigger')).nativeElement;

            flush();
        }));

        it('should select children with parent', () => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');
            options[4].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toContain('Chrome');
        });

        it('should select parent when all children are selected', () => {
            trigger.click();
            fixture.detectChanges();

            fixture.componentInstance.treeControl.expandAll();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-tree-option');
            options.forEach((o) => {
                if (['Calendar', 'Chrome', 'Webstorm'].includes(o.innerText)) {
                    o.click();
                    fixture.detectChanges();
                }
            });

            expect(fixture.componentInstance.control.value).toContain('Applications');
        });
    });
});
