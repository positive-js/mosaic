import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';
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
    themePalette = ThemePalette;

    position: McSidepanelPosition = McSidepanelPosition.Right;

    modalState: boolean = false;

    @ViewChild(TemplateRef, {static: false}) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength); // tslint:disable-line

    constructor(private sidepanelService: McSidepanelService) {}

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: this.modalState
        });
    }
}
