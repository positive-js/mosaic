import {
    Output,
    ChangeDetectionStrategy,
    Component,
    ElementRef, Input,
    OnDestroy, EventEmitter,
    ViewEncapsulation, HostBinding, Directive, ContentChild
} from '@angular/core';

import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { ENTER, SPACE } from '@ptsecurity/cdk/keycodes';


export enum Status {
    Info,
    Success,
    Warning,
    Error
}

@Directive({
    selector: '[content-left]'
})
export class ContentLeft {
}

@Directive({
    selector: '[content-right]'
})
export class ContentRight {
}

const name = 'mc-card';

@Component({
    selector: name,
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: name,
        '[class.mc-card_readonly]': 'readonly',
        '(keydown)': 'onKeyDown($event)'
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

    @Input()
    mode: 'color' | 'white' = 'color';

    @Input()
    status: Status = Status.Info;

    @ContentChild(ContentLeft)
    contentLeft: any;

    @ContentChild(ContentRight)
    contentRight: any;

    private _tabIndex: number | null = 0;

    constructor(private _elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
        this._focusMonitor.monitor(this._elementRef.nativeElement, false);
    }

    get statusClass() {
        switch (this.status) {
            case Status.Error:
                return `${name}_error`;
            case Status.Info:
                return `${name}_info`;
            case Status.Success:
                return `${name}_success`;
            case Status.Warning:
                return `${name}_warning`;
            default:
                return '';
        }
    }

    get isWhiteMode() {
        return this.mode === 'white';
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this.hostElement.focus();
    }

    clicked($event: MouseEvent) {
        if (!this.readonly) {
            $event.stopPropagation();
            this.selectedChange.emit(!this.selected);
        }
    }

    private get hostElement() {
        return this._elementRef.nativeElement;
    }

    onKeyDown($event: KeyboardEvent) {
        const keyCode = $event.keyCode;
        switch (keyCode) {
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
