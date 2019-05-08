import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ScrollingModule, VIRTUAL_SCROLL_STRATEGY } from '../../cdk/scrolling';
import { FixedSizeVirtualScrollStrategy } from '../../cdk/scrolling/fixed-size-virtual-scroll';


export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
    constructor() {
        super(50, 250, 500);
    }
}

@Component({
    selector: 'app',
    styleUrls: ['styles.css'],
    template: `
        <cdk-virtual-scroll-viewport class="example-viewport">
            <div *cdkVirtualFor="let item of items" class="example-item">{{item}}</div>
        </cdk-virtual-scroll-viewport>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}]
})
export class CdkVirtualScrollCustomStrategyExample {
    items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}

@NgModule({
    declarations: [
        CdkVirtualScrollCustomStrategyExample
    ],
    imports: [
        BrowserModule,
        ScrollingModule
    ],
    bootstrap: [
        CdkVirtualScrollCustomStrategyExample
    ]
})
export class DemoModule {
}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
