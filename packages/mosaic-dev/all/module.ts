// tslint:disable:no-console

import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McButtonToggleModule } from '@ptsecurity/mosaic/button-toggle';
import { McCardModule } from '@ptsecurity/mosaic/card';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { PopUpPlacements, ThemePalette } from '@ptsecurity/mosaic/core';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McLinkModule } from '@ptsecurity/mosaic/link';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McModalModule, McModalService } from '@ptsecurity/mosaic/modal';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';
import { McProgressBarModule } from '@ptsecurity/mosaic/progress-bar';
import { McProgressSpinnerModule, ProgressSpinnerMode } from '@ptsecurity/mosaic/progress-spinner';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McSplitterModule } from '@ptsecurity/mosaic/splitter';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { FlatTreeControl, McTreeFlatDataSource, McTreeFlattener, McTreeModule } from '@ptsecurity/mosaic/tree';
import { Observable, of as observableOf } from 'rxjs';

import { buildFileTree, FileFlatNode, FileNode, DATA_OBJECT } from '../tree/module';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;


const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    themePalette = ThemePalette;
    popUpPlacements = PopUpPlacements;

    checked: boolean[] = [true, true, false];
    indeterminate: boolean = true;
    disabled: boolean = false;
    labelPosition = 'after';

    valueBigOn: boolean = true;
    valueSmallOn: boolean = true;

    value: any;
    min: any;

    numberValue: number | null = null;

    buttonToggleModelResult: string;

    s1 = false;
    s2 = false;
    s3 = false;
    s4 = false;

    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

    folders = [
        {
            name: 'Photos',
            updated: new Date('1/1/16')
        },
        {
            name: 'Recipes',
            updated: new Date('1/17/16')
        },
        {
            name: 'Work',
            updated: new Date('1/28/16')
        }
    ];

    notes = [
        {
            name: 'Vacation Itinerary',
            updated: new Date('2/20/16')
        },
        {
            name: 'Kitchen Remodel',
            updated: new Date('1/18/16')
        }
    ];

    mode: ProgressSpinnerMode = 'determinate';
    percent: number = 0;
    intervalId: number;

    favoriteFruit: string;

    isDisabled: boolean = true;

    fruits = [
        'Apple',
        'Banana',
        'Tomato',
        'Крякать как уточка'
    ];

    selectionList = [
        {name: 'Yes', value: 'true', selected: false},
        {name: 'No', value: 'false', selected: true}
    ];

    singleSelected = 'Normal';
    multipleSelected = ['Normal', 'Hovered', 'Selected', 'Selected1', 'Boots', 'Clogs'];

    singleSelectFormControl = new FormControl('', Validators.required);

    multiSelectSelectFormControl = new FormControl([], Validators.pattern(/^w/));

    timeValue1: Moment = moment();

    treeControl: FlatTreeControl<FileFlatNode>;
    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    constructor(private modalService: McModalService) {
        setInterval(
            () => this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP),
            INTERVAL
        );

        this.treeFlattener = new McTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );

        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    showConfirm() {
        this.modalService.success({
            mcContent   : 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            mcOkText    : 'Сохранить',
            mcCancelText: 'Отмена',
            mcOnOk      : () => console.log('OK')
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }

    transformer = (node: FileNode, level: number) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }

    hasChild(_: number, nodeData: FileFlatNode) { return nodeData.expandable; }

    hasNestedChild(_: number, nodeData: FileNode) {
        return !(nodeData.type);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }

    private getValue = (node: FileNode): string => {
        return node.name;
    }

    private getViewValue = (node: FileNode): string => {
        return `${node.name} view`;
    }

    private getLevel = (node: FileFlatNode) => node.level;

    private isExpandable = (node: FileFlatNode) => node.expandable;

    private getChildren = (node: FileNode): Observable<FileNode[]> => {
        return observableOf(node.children);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        McIconModule,
        McButtonModule,
        McButtonToggleModule,
        McLinkModule,
        McCardModule,
        McCheckboxModule,
        McDropdownModule,
        McInputModule,
        McFormFieldModule,
        McNavbarModule,
        McListModule,
        McModalModule,
        McMomentDateModule,
        McLuxonDateModule,
        McProgressBarModule,
        McProgressSpinnerModule,
        McRadioModule,
        McSelectModule,
        McSplitterModule,
        McTagsModule,
        McTextareaModule,
        McTimepickerModule,
        McToggleModule,
        McToolTipModule,
        McTreeModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
