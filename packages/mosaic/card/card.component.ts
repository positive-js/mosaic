import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Output,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { SPACE } from '@ptsecurity/cdk/keycodes';
import { CanColorCtor, mixinColor } from '@ptsecurity/mosaic/core';


export class McCardBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McCardBaseMixin: CanColorCtor & typeof McCardBase = mixinColor(McCardBase);


@Component({
    selector: 'mc-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'mc-card',
        '[class.mc-card_readonly]': 'readonly',
        '[class.mc-selected]': 'selected',
        '[attr.tabindex]': 'tabIndex',
        '(keydown)': 'onKeyDown($event)',
        '(click)': 'onClick($event)'
    }
})
export class McCard extends McCardBaseMixin implements OnDestroy {
    @Input()
    readonly = false;

    @Input()
    selected = false;

    @Output()
    selectedChange = new EventEmitter<boolean>();

    @Input()
    get tabIndex(): number | null {
        return this.readonly ? null : this._tabIndex;
    }

    set tabIndex(value: number | null) {
        this._tabIndex = value;
    }

    private _tabIndex: number | null = 0;

    constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
        super(elementRef);

        this._focusMonitor.monitor(this._elementRef.nativeElement, false);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this.hostElement.focus();
    }

    onClick($event: MouseEvent) {
        if (!this.readonly) {
            $event.stopPropagation();

            this.selectedChange.emit(!this.selected);
        }
    }

    onKeyDown($event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        switch ($event.keyCode) {
            case SPACE:
                if (!this.readonly) {
                    $event.preventDefault();
                    this.selectedChange.emit(!this.selected);
                }
                break;
            default:
        }
    }

    private get hostElement() {
        return this._elementRef.nativeElement;
    }
}
