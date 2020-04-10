import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McListModule } from '@ptsecurity/mosaic/list';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['../main.scss', './styles.scss']
})
export class PanelDemoComponent {
    page: string = 'first';
    test: boolean = true;
    selectedItems = [];
    narwhalCategories = [];
}


@NgModule({
    declarations: [
        PanelDemoComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        McButtonModule,
        McIconModule,
        McListModule,
        FormsModule
    ],
    bootstrap: [
        PanelDemoComponent
    ]
})
export class DemoModule {}  // tslint:disable-line no-unnecessary-class
