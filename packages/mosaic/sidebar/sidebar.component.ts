import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
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


@Directive({
    selector: '[mc-sidebar-opened]',
    exportAs: 'mcSidebarOpened'
})
export class McSidebarOpened {
    @Input() width: number;
}

@Directive({
    selector: '[mc-sidebar-closed]',
    exportAs: 'mcSidebarClosed'
})
export class McSidebarClosed {
    @Input() width: number;
}


@Component({
    selector: 'mc-sidebar',
    exportAs: 'mcSidebar',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.css'],
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
export class McSidebar implements OnDestroy, OnInit {
    @Input() opened: boolean = true;

    @Input() position: SidebarPositions;

    @Input() params: { openedStateWidth: string; closedStateWidth: string };

    @Output() readonly stateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ContentChild(McSidebarOpened, { static: false }) openedContent: McSidebarOpened;

    @ContentChild(McSidebarClosed, { static: false }) closedContent: McSidebarClosed;

    get animationState(): McSidebarAnimationState {
        return this.opened ? McSidebarAnimationState.Opened : McSidebarAnimationState.Closed;
    }

    internalState: boolean = true;

    private documentKeydownListener: (event: KeyboardEvent) => void;

    constructor(private ngZone: NgZone) {}

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
        if (this.opened) {
            this.internalState = this.opened;
        }
    }

    onAnimationDone() {
        this.internalState = this.opened;

        this.stateChanged.emit(this.opened);
    }

    private registerKeydownListener(): void {
        this.documentKeydownListener = (event) => {
            if (isControl(event) || isInput(event)) { return; }

            if (
                (this.position === SidebarPositions.Left && isLeftBracket(event)) ||
                (this.position === SidebarPositions.Right && isRightBracket(event))
            ) {
                this.ngZone.run(() => this.opened = !this.opened);
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
}
