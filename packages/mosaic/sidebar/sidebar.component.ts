import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive, ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy, OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { isControl, isInput, isLeftBracket, isRightBracket } from '@ptsecurity/cdk/keycodes';

import { mcSidebarAnimations, McSidebarAnimationState } from './sidebar-animations';


export enum SidebarPositions {
    Left = 'left',
    Right = 'right'
}

// tslint:disable-next-line:naming-convention
interface McSidebarParams {
    openedStateMinWidth: string;
    openedStateWidth: string;
    openedStateMaxWidth: string;

    closedStateWidth: string;
}


@Directive({
    selector: '[mc-sidebar-opened]',
    exportAs: 'mcSidebarOpened'
})
export class McSidebarOpened {
    @Input() minWidth: string;
    @Input() width: string;
    @Input() maxWidth: string;
}

@Directive({
    selector: '[mc-sidebar-closed]',
    exportAs: 'mcSidebarClosed'
})
export class McSidebarClosed {
    @Input() width: string;
}


@Component({
    selector: 'mc-sidebar',
    exportAs: 'mcSidebar',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.scss'],
    host: {
        class: 'mc-sidebar',
        '[@state]': `{
            value: animationState,
            params: params
        }`,
        '(@state.start)': 'onAnimationStart()',
        '(@state.done)': 'onAnimationDone()'
    },
    animations: [mcSidebarAnimations.sidebarState],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McSidebar implements OnDestroy, OnInit, AfterContentInit {
    @Input()
    get opened(): boolean {
        return this._opened;
    }

    set opened(value: boolean) {
        if (this._opened) {
            this.saveWidth();
        }

        this._opened = value;
    }
    private _opened: boolean = true;

    @Input() position: SidebarPositions;

    params: McSidebarParams = {
        openedStateWidth: 'inherit',
        openedStateMinWidth: 'inherit',
        openedStateMaxWidth: 'inherit',

        closedStateWidth: '32px'
    };

    @Output() readonly stateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ContentChild(McSidebarOpened, { static: false }) openedContent: McSidebarOpened;

    @ContentChild(McSidebarClosed, { static: false }) closedContent: McSidebarClosed;

    get animationState(): McSidebarAnimationState {
        return this._opened ? McSidebarAnimationState.Opened : McSidebarAnimationState.Closed;
    }

    internalState: boolean = true;

    private documentKeydownListener: (event: KeyboardEvent) => void;

    constructor(private ngZone: NgZone, private elementRef: ElementRef) {}

    ngOnInit(): void {
        if (this.position === SidebarPositions.Left || this.position === SidebarPositions.Right) {
            this.registerKeydownListener();
        }
    }

    ngOnDestroy(): void {
        if (this.position === SidebarPositions.Left || this.position === SidebarPositions.Right) {
            this.unRegisterKeydownListener();
        }
    }

    toggle(): void {
        this.opened = !this.opened;
    }

    onAnimationStart() {
        if (this._opened) {
            this.internalState = this._opened;
        }
    }

    onAnimationDone() {
        this.internalState = this._opened;

        this.stateChanged.emit(this._opened);
    }

    ngAfterContentInit(): void {
        this.params = {
            openedStateWidth: this.openedContent.width || 'inherit',
            openedStateMinWidth: this.openedContent.minWidth || 'inherit',
            openedStateMaxWidth: this.openedContent.maxWidth || 'inherit',

            closedStateWidth: this.closedContent.width || '32px'
        };
    }

    private registerKeydownListener(): void {
        this.documentKeydownListener = (event) => {
            if (isControl(event) || isInput(event)) { return; }

            if (
                (this.position === SidebarPositions.Left && isLeftBracket(event)) ||
                (this.position === SidebarPositions.Right && isRightBracket(event))
            ) {
                this.ngZone.run(() => this._opened = !this._opened);
            }
        };

        this.ngZone.runOutsideAngular(() => {
            // tslint:disable-next-line: no-unbound-method
            document.addEventListener('keypress', this.documentKeydownListener, true);
        });
    }

    private unRegisterKeydownListener(): void {
        // tslint:disable-next-line: no-unbound-method
        document.removeEventListener('keypress', this.documentKeydownListener, true);
    }

    private saveWidth() {
        this.params.openedStateWidth = `${this.elementRef.nativeElement.offsetWidth}px`;
    }
}
