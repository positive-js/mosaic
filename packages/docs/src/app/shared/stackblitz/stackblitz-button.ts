import { Component, Input, NgModule, NgZone } from '@angular/core';
import { ExampleData } from '@ptsecurity/mosaic-examples';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { StackblitzWriter } from './stackblitz-writer';


@Component({
    selector: 'stackblitz-button',
    templateUrl: './stackblitz-button.html',
    styleUrls: ['./stackblitz-button.scss']
})
export class StackblitzButton {

    @Input()
    set example(exampleId: string | undefined) {
        if (exampleId) {
            this.exampleData = new ExampleData(exampleId);
            this.prepareStackBlitzForExample(exampleId, this.exampleData);
        } else {
            this.exampleData = undefined;
            this.openStackBlitzFn = null;
        }
    }

    exampleData: ExampleData | undefined;

    private openStackBlitzFn: (() => void) | null = null;

    constructor(private stackBlitzWriter: StackblitzWriter,
                private ngZone: NgZone) {
    }

    openStackBlitz(): void {
        if (this.openStackBlitzFn) {
            this.openStackBlitzFn();
        } else {
            // tslint:disable-next-line:no-console
            console.log('StackBlitz is not ready yet. Please try again in a few seconds.');
        }
    }

    private prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
        this.ngZone.runOutsideAngular(async () => {
            this.openStackBlitzFn = await this.stackBlitzWriter
                .constructStackblitzForm(exampleId, data);
        });
    }
}

@NgModule({
    imports: [McButtonModule, McIconModule, McLinkModule],
    exports: [StackblitzButton],
    declarations: [StackblitzButton],
    providers: [StackblitzWriter]
})
export class StackblitzButtonModule {
}
