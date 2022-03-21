// tslint:disable:no-console
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { Direction, McSplitterModule } from '../../mosaic/splitter';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    guttersVisibility = true;

    DIRECTION = Direction;

    toggleVisibility() {
        this.guttersVisibility = !this.guttersVisibility;
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        McButtonModule,
        McSplitterModule,
        McIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
