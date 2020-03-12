import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Output,
    ChangeDetectionStrategy,
    Component,
    ElementRef, Input,
    OnDestroy, EventEmitter,
    ViewEncapsulation, HostBinding
} from '@angular/core';
import { SPACE } from '@ptsecurity/cdk/keycodes';


@Component({
    selector: 'mc-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'mc-card',
        '[class.mc-card_readonly]': 'readonly',
        '[class.mc-card_selected]': 'selected',
        '(keydown)': 'onKeyDown($event)',
        '(click)': 'onClick($event)'
    }
})
export class McCard implements OnDestroy {
    get tabIndex(): number | null {
        return this.readonly ? null : this._tabIndex;
    }

    @HostBinding('attr.tabIndex')
    @Input()
    set tabIndex(value: number | null) {
        this._tabIndex = value;
    }

    @Input()
    readonly = false;

    @Input()
    selected = false;

    @Output()
    selectedChange = new EventEmitter<boolean>();

    private _tabIndex: number | null = 0;

    constructor(private _elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
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

    private get hostElement() {
        return this._elementRef.nativeElement;
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
}
