/* tslint:disable:no-magic-numbers max-func-body-length no-reserved-keywords */
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { createMouseEvent, dispatchEvent } from '@ptsecurity/cdk/testing';
import { FlatTreeControl } from '@ptsecurity/cdk/tree';

import {
    McTreeSelection,
    McTreeFlatDataSource,
    McTreeFlattener,
    McTreeModule
} from './index';


describe('McTreeSelection', () => {
    let treeElement: HTMLElement;

    function configureMcTreeTestingModule(declarations) {
        TestBed.configureTestingModule({
            imports: [McTreeModule, FormsModule],
            declarations
        }).compileComponents();
    }

    describe('flat tree', () => {
        describe('should initialize', () => {
            let fixture: ComponentFixture<SimpleMcTreeApp>;
            let component: SimpleMcTreeApp;

            beforeEach(() => {
                configureMcTreeTestingModule([SimpleMcTreeApp]);
                fixture = TestBed.createComponent(SimpleMcTreeApp);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('.mc-tree-selection');

                fixture.detectChanges();
            });

            it('with rendered dataNodes', () => {
                const nodes = getNodes(treeElement);

                expect(nodes).toBeDefined('Expect nodes to be defined');
                expect(nodes[0].classList).toContain('customNodeClass');
            });

            it('with the right data', () => {
                expect(component.treeData.length).toBe(5);

                expectFlatTreeToMatch(
                    treeElement,
                    28,
                    [`rootNode_1`], [`Pictures`], [`Documents`], [`Downloads`], [`Applications`]
                );
            });
        });

        describe('with toggle', () => {
            let fixture: ComponentFixture<McTreeAppWithToggle>;
            let component: McTreeAppWithToggle;

            beforeEach(() => {
                configureMcTreeTestingModule([McTreeAppWithToggle]);
                fixture = TestBed.createComponent(McTreeAppWithToggle);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('mc-tree-selection');

                fixture.detectChanges();
            });

            it('should expand/collapse the node', () => {
                expect(component.treeData.length).toBe(5);

                expect(component.treeControl.expansionModel.selected.length)
                    .toBe(0, `Expect no expanded node`);

                component.toggleRecursively = false;

                expectFlatTreeToMatch(
                    treeElement,
                    40,
                    [`rootNode_1`], [`Pictures`], [`Documents`], [`Downloads`], [`Applications`]
                );

                (getNodes(treeElement)[1].querySelectorAll('mc-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expect(component.treeControl.expansionModel.selected.length)
                    .toBe(1, `Expect node expanded one level`);
                expectFlatTreeToMatch(
                    treeElement,
                    40,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[5].querySelectorAll('mc-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expect(component.treeControl.expansionModel.selected.length).toBe(2, `Expect node expanded`);
                expectFlatTreeToMatch(
                    treeElement,
                    40,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [null, `Pictures`],
                    [null, `angular`],
                    [null, `material2`],
                    [`Downloads`],
                    [`Applications`]
                );

                (getNodes(treeElement)[5].querySelectorAll('mc-tree-node-toggle')[0] as HTMLElement).click();
                fixture.detectChanges();

                expectFlatTreeToMatch(
                    treeElement,
                    40,
                    [`rootNode_1`],
                    [`Pictures`],
                    [null, 'Sun'],
                    [null, 'Woods'],
                    [null, 'PhotoBoothLibrary'],
                    [`Documents`],
                    [`Downloads`],
                    [`Applications`]
                );
            });
        });

        describe('with multipleMode is CTRL', () => {
            let fixture: ComponentFixture<McTreeAppMultiple>;
            let component: McTreeAppMultiple;

            beforeEach(() => {
                configureMcTreeTestingModule([McTreeAppMultiple]);
                fixture = TestBed.createComponent(McTreeAppMultiple);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('mc-tree-selection');

                fixture.detectChanges();
            });

            describe('when ctrl is pressed', () => {
                it('should select node', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');
                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(2);

                    dispatchEvent(nodes[4], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(3);
                });

                it('should deselect', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');
                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(2);

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();
                    expect(component.modelValue.length).toBe(1);
                });
            });

            describe('when ctrl is not pressed', () => {
                describe('should reset selection', () => {
                    it('when clicked on selected node', () => {
                        const nodes = getNodes(treeElement);

                        const event = createMouseEvent('click');
                        Object.defineProperty(event, 'ctrlKey', {get: () => true});

                        dispatchEvent(nodes[0], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);

                        dispatchEvent(nodes[2], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(2);

                        Object.defineProperty(event, 'ctrlKey', {get: () => false});

                        dispatchEvent(nodes[2], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);
                    });

                    it('when clicked on not selected node', () => {
                        const nodes = getNodes(treeElement);

                        const event = createMouseEvent('click');
                        Object.defineProperty(event, 'ctrlKey', {get: () => true});

                        dispatchEvent(nodes[0], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);

                        dispatchEvent(nodes[2], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(2);

                        Object.defineProperty(event, 'ctrlKey', {get: () => false});

                        dispatchEvent(nodes[3], event);
                        fixture.detectChanges();
                        expect(component.modelValue.length).toBe(1);
                    });
                });
            });

            describe('when shift is pressed', () => {
                it('should select nodes', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(1);

                    const targetNode: HTMLElement = nodes[3] as HTMLElement;

                    targetNode.focus();

                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    dispatchEvent(targetNode, event);
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(4);
                });

                it('should deselect nodes', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');
                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    dispatchEvent(nodes[1], event);
                    dispatchEvent(nodes[2], event);
                    (nodes[2] as HTMLElement).focus();
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(3);

                    const targetNode: HTMLElement = nodes[0] as HTMLElement;

                    Object.defineProperty(event, 'ctrlKey', { get: () => false });
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    dispatchEvent(targetNode, event);
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(0);
                });

                it('should set last selected status', () => {
                    expect(component.modelValue.length).toBe(0);

                    const nodes = getNodes(treeElement);

                    const event = createMouseEvent('click');
                    Object.defineProperty(event, 'ctrlKey', { get: () => true });

                    dispatchEvent(nodes[0], event);
                    fixture.detectChanges();

                    dispatchEvent(nodes[2], event);
                    fixture.detectChanges();

                    dispatchEvent(nodes[4], event);
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(3);

                    const targetNode: HTMLElement = nodes[2] as HTMLElement;

                    targetNode.focus();

                    Object.defineProperty(event, 'ctrlKey', { get: () => false });
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    dispatchEvent(targetNode, event);
                    fixture.detectChanges();

                    expect(component.modelValue.length).toBe(1);
                });
            });
        });

        describe('with when node template', () => {
            let fixture: ComponentFixture<WhenNodeMcTreeApp>;

            beforeEach(() => {
                configureMcTreeTestingModule([WhenNodeMcTreeApp]);
                fixture = TestBed.createComponent(WhenNodeMcTreeApp);

                treeElement = fixture.nativeElement.querySelector('mc-tree-selection');

                fixture.detectChanges();
            });

            it('with the right data', () => {
                expectFlatTreeToMatch(
                    treeElement,
                    40,
                    [`>>>rootNode_1`], [`Pictures`], [`Documents`], [`Downloads`], [`Applications`]
                );
            });
        });

        describe('should initialize', () => {
            let fixture: ComponentFixture<FiltrationMcTreeApp>;
            let component: FiltrationMcTreeApp;

            beforeEach(() => {
                configureMcTreeTestingModule([FiltrationMcTreeApp]);
                fixture = TestBed.createComponent(FiltrationMcTreeApp);

                component = fixture.componentInstance;
                treeElement = fixture.nativeElement.querySelector('.mc-tree-selection');

                fixture.detectChanges();
            });

            it('should filter nodes by condition', () => {
                let nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Pictures');
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(3);

                component.treeControl.filterNodes('Documents');
                fixture.detectChanges();
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(1);

                component.treeControl.filterNodes('condition for filter all nodes');
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(0);
            });

            it('should filter nodes and but not their parents', () => {
                let nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Sun');
                nodes = getNodes(treeElement);

                const parentOfFoundedNode = nodes[0].textContent!.trim();
                expect(parentOfFoundedNode).toBe('Pictures');

                const foundedNode = nodes[1].textContent!.trim();
                expect(foundedNode).toBe('Sun');

                expect(nodes.length).toBe(2);
            });

            it('should delete filtration with empty condition', () => {
                let nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);

                component.treeControl.filterNodes('Pictures');
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(3);

                component.treeControl.filterNodes('');
                nodes = getNodes(treeElement);
                expect(nodes.length).toBe(5);
            });
        });
    });
});


export const DATA_OBJECT = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: 'jpg'
    },
    Documents: {
        Pictures: 'Pictures',
        angular: 'ts',
        material2: 'ts'
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

export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
    isSpecial: boolean;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
    isSpecial: boolean;
}

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

function getNodes(treeElement: Element): Element[] {
    // tslint:disable-next-line: no-unnecessary-type-assertion
    return [].slice.call(treeElement.querySelectorAll('.mc-tree-option'))!;
}

function expectFlatTreeToMatch(treeElement: Element, expectedPaddingIndent: number = 28, ...expectedTree: any[]) {
    const missedExpectations: string[] = [];

    function checkNode(node: Element, expectedNode: any[]) {
        const actualTextContent = node.textContent!.trim();
        const expectedTextContent = expectedNode[expectedNode.length - 1];

        if (actualTextContent !== expectedTextContent) {
            missedExpectations.push(`Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`);
        }
    }

    function checkLevel(node: Element, expectedNode: any[]) {
        const actualLevel = (node as HTMLElement).style.paddingLeft;

        if (expectedNode.length === 1) {

            if (actualLevel !== `12px`) {
                missedExpectations.push(`Expected node level to be 0 but was ${actualLevel}`);
            }
        } else {
            const expectedLevel = `${((expectedNode.length - 1) * expectedPaddingIndent) + 12}px`;

            if (actualLevel !== expectedLevel) {
                missedExpectations.push(`Expected node level to be ${expectedLevel} but was ${actualLevel}`);
            }
        }
    }

    getNodes(treeElement).forEach((node, index) => {
        const expected = expectedTree ? expectedTree[index] : null;

        checkLevel(node, expected);
        checkNode(node, expected);
    });

    if (missedExpectations.length) {
        fail(missedExpectations.join('\n'));
    }
}

@Component({
    template: `
        <mc-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl">

            <mc-tree-option
                *mcTreeNodeDef="let node" class="customNodeClass"
                mcTreeNodePadding [mcTreeNodePaddingIndent]="28"
                mcTreeNodeToggle>
                {{ node.name }}
            </mc-tree-option>
        </mc-tree-selection>
    `
})
class SimpleMcTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    @ViewChild(McTreeSelection, { static: false }) tree: McTreeSelection;

    constructor() {
        this.treeFlattener = new McTreeFlattener<FileNode, FileFlatNode>(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }
}

@Component({
    template: `
        <mc-tree-selection
            [(ngModel)]="modelValue"
            multiple="keyboard"
            [dataSource]="dataSource"
            [treeControl]="treeControl">

            <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                {{ node.name }}
            </mc-tree-option>

            <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                <mc-tree-node-toggle></mc-tree-node-toggle>

                {{ node.name }}
            </mc-tree-option>
        </mc-tree-selection>
    `
})
class McTreeAppMultiple {
    modelValue = [];
    toggleRecursively: boolean = true;
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    @ViewChild(McTreeSelection, { static: false }) tree: McTreeSelection;

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);

        this.treeFlattener = new McTreeFlattener<FileNode, FileFlatNode>(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }
}

@Component({
    template: `
        <mc-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl">

            <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                {{ node.name }}
            </mc-tree-option>

            <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                <mc-tree-node-toggle></mc-tree-node-toggle>

                {{ node.name }}
            </mc-tree-option>
        </mc-tree-selection>
    `
})
class McTreeAppWithToggle {
    toggleRecursively: boolean = true;
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    @ViewChild(McTreeSelection, { static: false }) tree: McTreeSelection;

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);

        this.treeFlattener = new McTreeFlattener<FileNode, FileFlatNode>(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }
}

@Component({
    template: `
        <mc-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <mc-tree-option
                    *mcTreeNodeDef="let node"
                    mcTreeNodePadding>
                {{ node.name }}
            </mc-tree-option>

            <mc-tree-option
                *mcTreeNodeDef="let node; when: isSpecial"
                mcTreeNodePadding>
                >>>{{ node.name }}
            </mc-tree-option>
        </mc-tree-selection>
    `
})
class WhenNodeMcTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    @ViewChild(McTreeSelection, { static: false }) tree: McTreeSelection;

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.treeFlattener = new McTreeFlattener<FileNode, FileFlatNode>(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        flatNode.isSpecial = !node.children;

        return flatNode;
    }

    isSpecial = (_: number, node: FileFlatNode) => node.isSpecial;
}

@Component({
    template: `
        <mc-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl">

            <mc-tree-option *mcTreeNodeDef="let node" mcTreeNodePadding>
                {{ node.name }}
            </mc-tree-option>

            <mc-tree-option *mcTreeNodeDef="let node; when: hasChild" mcTreeNodePadding>
                {{ node.name }}
            </mc-tree-option>
        </mc-tree-selection>
    `
})
class FiltrationMcTreeApp {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    treeData: FileNode[];

    @ViewChild(McTreeSelection, { static: false }) tree: McTreeSelection;

    constructor() {
        this.treeFlattener = new McTreeFlattener<FileNode, FileFlatNode>(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getValue);
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }
}
