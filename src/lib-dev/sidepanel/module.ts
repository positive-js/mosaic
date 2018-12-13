import { CommonModule } from '@angular/common';
import {
    Component,
    NgModule,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McSidepanelPosition, McSidepanelService } from '@ptsecurity/mosaic/sidepanel';
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

    constructor(private sidepanelService: McSidepanelService) {}

    openComponentSidepanel() {
        this.sidepanelService.open(ExampleSidepanelComponent, {
            position: McSidepanelPosition.Right
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
    template: `<div>Sidepanel Component Content</div>`
})
export class ExampleSidepanelComponent {}

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
        McButtonModule
    ],
    bootstrap: [
        SidepanelDemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

