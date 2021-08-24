import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McDividerModule } from '@ptsecurity/mosaic/divider';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        McDividerModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
