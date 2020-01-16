import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { McSidepanelPosition, McSidepanelService } from '@ptsecurity/mosaic/sidepanel';


/**
 * @title Template Modal
 */
@Component({
    selector: 'sidepanel-overview-example',
    templateUrl: 'sidepanel-overview-example.html',
    styleUrls: ['sidepanel-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SidepanelOverviewExample {
    @ViewChild(TemplateRef, {static: false}) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength); // tslint:disable-line

    constructor(private sidepanelService: McSidepanelService) {}

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: McSidepanelPosition.Bottom
        });
    }
}
