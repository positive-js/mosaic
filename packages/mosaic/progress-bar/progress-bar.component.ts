import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    ElementRef,
    Input
} from '@angular/core';
import { CanColor, CanColorCtor, mixinColor, ThemePalette } from '@ptsecurity/mosaic/core';


export type ProgressBarMode = 'determinate' | 'indeterminate';

let idIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

export class McProgressBarBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McProgressBarMixinBase:
    CanColorCtor &
    typeof McProgressBarBase =
        mixinColor(McProgressBarBase);

@Component({
    selector: 'mc-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'mc-progress-bar',
        '[attr.id]': 'id'
    }
})
export class McProgressBar extends McProgressBarMixinBase implements CanColor {
    @Input() id: string = `mc-progress-bar-${idIterator++}`;
    @Input() value: number = 0;
    @Input() mode: ProgressBarMode = 'determinate';
    @Input() color: ThemePalette = ThemePalette.Primary;

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value)) / MAX_PERCENT;
    }
}
