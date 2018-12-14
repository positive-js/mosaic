import { CommonModule } from '@angular/common';
import {
    Component, Inject,
    NgModule,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { MC_SIDEPANEL_DATA, McSidepanelPosition, McSidepanelService } from '@ptsecurity/mosaic/sidepanel';
import { McSidepanelModule } from '@ptsecurity/mosaic/sidepanel/sidepanel.module';


// tslint:disable:no-console
@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SidepanelDemoComponent {
    @ViewChild(TemplateRef) template: TemplateRef<any>;

    array = new Array(40); // tslint:disable-line

    constructor(private sidepanelService: McSidepanelService) {}

    openComponentSidepanel() {
        this.sidepanelService.open(ExampleSidepanelComponent, {
            position: McSidepanelPosition.Right,
            data: {
                openComponentSidepanel: () => { this.openComponentSidepanel(); }
            }
        });
    }

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: McSidepanelPosition.Bottom
        });
    }
}

@Component({
    selector: 'example-sidepanel',
    template: `
    <div class="mc-sidepanel-header">
        <div class="mc-title">Sidepanel Component Content</div>
        <button mc-sidepanel-close>
            <span class="mc-sidepanel-close-x">
                <i mc-icon="mc-close-L_16" class="mc-icon mc-icon_light" color="second"></i>
            </span>
        </button>
    </div>
    <div class="mc-sidepanel-body layout-padding">
        <div class="mc-subheading">Sidepanel Component Body</div>

        <div *ngFor="let item of array; index as i">
            {{ i + 1 }}
        </div>
    </div>
    <div class="mc-sidepanel-footer">
        <div class="mc-sidepanel-actions_left">
            <button mc-button color="primary" (click)="openComponentSidepanel()">
                <span>Open another sidepanel</span>
            </button>
        </div>
        <div class="mc-sidepanel-actions_right">
            <button mc-button color="primary" (click)="openComponentSidepanel()">
                <span>Open another sidepanel</span>
            </button>

            <button mc-button color="second" mc-sidepanel-close>
                <span>Close</span>
            </button>
        </div>
    </div>`,
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
        McSidepanelModule,
        McButtonModule,
        McIconModule
    ],
    bootstrap: [
        SidepanelDemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

