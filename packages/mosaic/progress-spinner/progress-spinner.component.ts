import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    ElementRef,
    Input
} from '@angular/core';
import { CanColor, CanColorCtor, mixinColor, ThemePalette } from '@ptsecurity/mosaic/core';


export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

let idIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

export class McProgressSpinnerBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McProgressSpinnerMixinBase:
    CanColorCtor &
    typeof McProgressSpinnerBase =
        mixinColor(McProgressSpinnerBase);

const MAX_DASH_ARRAY = 273;

@Component({
    selector: 'mc-progress-spinner',
    templateUrl: './progress-spinner.component.html',
    styleUrls: ['./progress-spinner.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'mc-progress-spinner',
        '[attr.id]': 'id'
    }
})
export class McProgressSpinner extends McProgressSpinnerMixinBase implements CanColor {
    @Input() id: string = `mc-progress-spinner-${idIterator++}`;
    @Input() value: number = 0;
    @Input() mode: ProgressSpinnerMode = 'determinate';
    @Input() color: ThemePalette = ThemePalette.Primary;

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value)) / MAX_PERCENT;
    }

    get dashOffsetPercent(): string {
        return `${MAX_DASH_ARRAY - this.percentage * MAX_DASH_ARRAY}%`;
    }
}
