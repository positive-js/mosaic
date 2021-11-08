import { CommonModule } from '@angular/common';
import {
    Component, Inject,
    NgModule,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { MC_SIDEPANEL_DATA, McSidepanelPosition, McSidepanelService, McSidepanelModule } from '@ptsecurity/mosaic/sidepanel';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';


// tslint:disable:no-console
@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SidepanelDemoComponent {
    position: McSidepanelPosition = McSidepanelPosition.Right;

    modalState: boolean = false;

    @ViewChild(TemplateRef, {static: false}) template: TemplateRef<any>;

    array = new Array(40); // tslint:disable-line

    constructor(private sidepanelService: McSidepanelService) {}

    openComponentSidepanel() {
        this.sidepanelService.open(ExampleSidepanelComponent, {
            hasBackdrop: this.modalState,
            position: this.position,
            data: {
                openComponentSidepanel: () => { this.openComponentSidepanel(); }
            }
        });
    }

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: this.modalState
        });
    }
}

@Component({
    selector: 'example-sidepanel',
    template: `
    <mc-sidepanel-header [closeable]="true">
        Sidepanel Component Content
    </mc-sidepanel-header>

    <mc-sidepanel-body class="layout-padding">
        <div class="mc-subheading">Sidepanel Component Body</div>

        <div *ngFor="let item of array; index as i">
            {{ i + 1 }}
        </div>
    </mc-sidepanel-body>

    <mc-sidepanel-footer>
        <mc-sidepanel-actions align="right">
            <button cdkFocusInitial mc-button [color]="'primary'" (click)="openComponentSidepanel()">
                <span>Open another sidepanel</span>
            </button>

            <button mc-button [color]="'second'" mc-sidepanel-close>
                <span>Close</span>
            </button>
        </mc-sidepanel-actions>
    </mc-sidepanel-footer>`,
    host: {
        class: 'layout-column flex'
    }
})
export class ExampleSidepanelComponent {
    openComponentSidepanel: () => void;

    array = new Array(60); // tslint:disable-line

    constructor(@Inject(MC_SIDEPANEL_DATA) public data: any) {
        this.openComponentSidepanel = data.openComponentSidepanel;
    }
}

@NgModule({
    declarations: [
        SidepanelDemoComponent,
        ExampleSidepanelComponent
    ],
    entryComponents: [
        ExampleSidepanelComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        McSidepanelModule,
        McButtonModule,
        McIconModule,
        McFormFieldModule,
        McSelectModule,
        McToggleModule
    ],
    bootstrap: [
        SidepanelDemoComponent
    ]
})
export class DemoModule {}
