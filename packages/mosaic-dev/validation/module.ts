/* tslint:disable:no-console no-reserved-keywords */
import { ChangeDetectorRef, Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER } from '@ptsecurity/cdk/keycodes';
import { CdkTreeModule, FlatTreeControl } from '@ptsecurity/cdk/tree';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTagInputEvent, McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { McTreeFlatDataSource, McTreeFlattener, McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';


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


export function ldapLoginValidator(loginRegex: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const allowed = loginRegex.test(control.value);

        return allowed ? null : { ldapLogin: { value: control.value } };
    };
}

function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}

function compositeFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        console.log('compositeFormValidator');
        const start = g.get('start')?.value;
        const end = g.get('end')?.value;

        if (IP_PATTERN.test(start) && IP_PATTERN.test(end)) {
            const parsedStartIp = start.split('.').map((octet) => parseInt(octet, 10));
            const parsedEndIp = end.split('.').map((octet) => parseInt(octet, 10));

            for (let i = 0; i < parsedStartIp.length; i++) {
                if (parsedStartIp[i] > parsedEndIp[i]) { return { range: true }; }
            }
        }

        return null;
    };
}

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    feedbackForm: FormGroup;
    feedbackFormWithHints: FormGroup;
    globalErrorForm: FormGroup;
    smallForm: FormGroup;
    checkOnFlyForm: FormGroup;
    compositeForm: FormGroup;

    @ViewChild('tooltip', { static: false }) tooltip: any;

    showServerErrors: boolean = false;
    inProgress: boolean = false;

    ipAddress: FormControl;

    reactiveTypeaheadItems: string[] = [];
    inputValue: string = '';
    selectValue: string = '';
    treeSelectValue: string = '';
    typeaheadItems: string[] = [];

    control = new FormControl('', [Validators.pattern('[a-zA-Z]*')]);

    inputControl = new FormControl('', [Validators.pattern('[a-zA-Z]*')]);
    tagsControl = new FormControl([], Validators.required);

    value = '';

    reactiveForm: FormGroup;

    formWithCustomValidator = new FormGroup(
        {
            login: new FormControl(
                '',
                [
                    Validators.required,
                    ldapLoginValidator(/^[a-zA-Z0-9_\-.+]+@[a-zA-Z0-9_\-.]+$/)
                ]
            ),
            password: new FormControl('', Validators.required)
        });

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: McTreeFlattener<FileNode, FileFlatNode>;

    dataSource: McTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor(private formBuilder: FormBuilder, public changeDetectorRef: ChangeDetectorRef) {
        this.feedbackFormWithHints = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });

        this.feedbackForm = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });

        this.globalErrorForm = new FormGroup({
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            thirdName: new FormControl('')
        });

        this.smallForm = new FormGroup({
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required)
        }, emptyFormValidator());

        this.checkOnFlyForm = new FormGroup({
            folderName: new FormControl('')
        });

        this.compositeForm = new FormGroup({
            start: new FormControl('', [Validators.pattern(IP_PATTERN)]),
            end: new FormControl('', [Validators.pattern(IP_PATTERN)])
        }, compositeFormValidator());

        this.ipAddress = new FormControl('', [Validators.pattern(IP_PATTERN)]);

        this.treeFlattener = new McTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );
        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);

        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new FormControl('', [
                Validators.required, Validators.pattern('[a-zA-Z]*')
            ]),
            reactiveSelectValue: new FormControl('', [Validators.required]),
            reactiveTreeSelectValue: new FormControl('', [Validators.required]),
            reactiveTypeaheadValue: new FormControl([], Validators.required),
            tagInputFormControl: new FormControl('', [Validators.pattern('[a-zA-Z]*')])
        });

        this.reactiveForm.valueChanges.subscribe((value) => {
            console.log('reactiveForm valueChanges: ', value); // tslint:disable-line:no-console
        });
        //
        this.inputControl.valueChanges.subscribe((value) => {
            console.log('inputControl valueChanges: ', value); // tslint:disable-line:no-console
        });
    }

    onSubmitReactiveForm(form: FormGroup) {
        console.log('onSubmitReactiveForm: ', form);
    }

    onSubmitFeedbackForm(form: FormGroup) {
        console.log('onSubmitReactiveForm: ', form);
    }

    onInput(event) {
        const regex = /^\d+$/g;

        if (!regex.test(event.target.value)) {
            event.target.value = event.target.value.replace(/\D+/g, '');

            if (!this.tooltip.isTooltipOpen) {
                this.tooltip.show();

                setTimeout(() => this.tooltip.hide(), 3000);
            }
        }
    }

    submitGlobalErrorForm() {
        this.showServerErrors = false;
        this.inProgress = true;

        setTimeout(() => {
            this.showServerErrors = true;
            this.inProgress = false;
        // tslint:disable-next-line:no-magic-numbers
        }, 1000);
    }

    onSubmitTemplateForm(form: NgForm) {
        console.log('onSubmitTemplateForm: ', form);
    }

    onSubmitFormWithCustomValidator(form: FormGroup) {
        console.log('onSubmitFormWithCustomValidator: ', form);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    reactiveInputOnCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.reactiveTypeaheadItems.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    reactiveInputOnRemoveTag(tag: string): void {
        const index = this.reactiveTypeaheadItems.indexOf(tag);

        if (index >= 0) {
            this.reactiveTypeaheadItems.splice(index, 1);
        }
    }

    inputOnCreate(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.typeaheadItems.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    inputOnRemoveTag(tag: string): void {
        const index = this.typeaheadItems.indexOf(tag);

        if (index >= 0) {
            this.typeaheadItems.splice(index, 1);
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
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        McButtonModule,
        McToolTipModule,
        McAutocompleteModule,
        McTagsModule,
        McInputModule,
        McTextareaModule,
        McSelectModule,
        McTreeModule,
        CdkTreeModule,
        McTreeSelectModule,
        McFormFieldModule,
        McIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
