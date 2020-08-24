import { AnimationEvent } from '@angular/animations';
import { Directionality, Direction } from '@angular/cdk/bidi';
import { TemplatePortal, CdkPortalOutlet } from '@angular/cdk/portal';
import {
    Component,
    ChangeDetectorRef,
    Input,
    Inject,
    Output,
    EventEmitter,
    OnDestroy,
    OnInit,
    ElementRef,
    Directive,
    Optional,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ComponentFactoryResolver,
    ViewContainerRef,
    forwardRef,
    ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { mcTabsAnimations } from './tabs-animations';


/**
 * These position states are used internally as animation states for the tab body. Setting the
 * position state to left, right, or center will transition the tab body from its current
 * position to its respective state. If there is not current position (void, in the case of a new
 * tab body), then there will be no transition animation to its state.
 *
 * In the case of a new tab body that should immediately be centered with an animating transition,
 * then left-origin-center or right-origin-center can be used, which will use left or right as its
 * psuedo-prior state.
 */
export type McTabBodyPositionState =
    'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 */
export type McTabBodyOriginState = 'left' | 'right';

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
    selector: 'mc-tab-body',
    templateUrl: 'tab-body.html',
    styleUrls: ['tab-body.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcTabsAnimations.translateTab],
    host: {
        class: 'mc-tab-body'
    }
})
export class McTabBody implements OnInit, OnDestroy {

    /** The shifted index position of the tab body, where zero represents the active center tab. */
    @Input()
    set position(position: number) {
        this.positionIndex = position;
        this.computePositionAnimationState();
    }

    /** Tab body position state. Used by the animation trigger for the current state. */
    bodyPosition: McTabBodyPositionState;

    /** Event emitted when the tab begins to animate towards the center as the active tab. */
    @Output() readonly onCentering: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted before the centering of the tab begins. */
    @Output() readonly beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted before the centering of the tab begins. */
    @Output() readonly afterLeavingCenter: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the tab completes its animation towards the center. */
    @Output() readonly onCentered: EventEmitter<void> = new EventEmitter<void>(true);

    /** The portal host inside of this container into which the tab body content will be loaded. */
    @ViewChild(CdkPortalOutlet, {static: false}) portalHost: CdkPortalOutlet;

    /** The tab body content to display. */
    @Input('content') content: TemplatePortal;

    /** Position that will be used when the tab is immediately becoming visible after creation. */
    @Input() origin: number;

    // Note that the default value will always be overwritten by `McTabBody`, but we need one
    // anyway to prevent the animations module from throwing an error if the body is used on its own.
    /** Duration for the tab's animation. */
    @Input() animationDuration: string = '0ms';

    /** Current position of the tab-body in the tab-group. Zero means that the tab is visible. */
    private positionIndex: number;

    /** Subscription to the directionality change observable. */
    private dirChangeSubscription = Subscription.EMPTY;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        @Optional() private dir: Directionality,
        changeDetectorRef: ChangeDetectorRef
    ) {
        if (this.dir && changeDetectorRef) {
            this.dirChangeSubscription = this.dir.change
                .subscribe((direction: Direction) => {
                    this.computePositionAnimationState(direction);
                    changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * After initialized, check if the content is centered and has an origin. If so, set the
     * special position states that transition the tab from the left or right before centering.
     */
    ngOnInit() {
        if (this.bodyPosition === 'center' && this.origin != null) {
            this.bodyPosition = this.computePositionFromOrigin();
        }
    }

    ngOnDestroy() {
        this.dirChangeSubscription.unsubscribe();
    }

    onTranslateTabStarted(e: AnimationEvent): void {
        const isCentering = this.isCenterPosition(e.toState);
        this.beforeCentering.emit(isCentering);

        if (isCentering) {
            this.onCentering.emit(this.elementRef.nativeElement.clientHeight);
        }
    }

    onTranslateTabComplete(e: AnimationEvent): void {
        // If the transition to the center is complete, emit an event.
        if (this.isCenterPosition(e.toState) && this.isCenterPosition(this.bodyPosition)) {
            this.onCentered.emit();
        }

        if (this.isCenterPosition(e.fromState) && !this.isCenterPosition(this.bodyPosition)) {
            this.afterLeavingCenter.emit();
        }
    }

    /** The text direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir && this.dir.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Whether the provided position state is considered center, regardless of origin. */
    isCenterPosition(position: McTabBodyPositionState | string): boolean {
        return position === 'center' ||
            position === 'left-origin-center' ||
            position === 'right-origin-center';
    }

    /** Computes the position state that will be used for the tab-body animation trigger. */
    private computePositionAnimationState(dir: Direction = this.getLayoutDirection()) {
        if (this.positionIndex < 0) {
            this.bodyPosition = dir === 'ltr' ? 'left' : 'right';
        } else if (this.positionIndex > 0) {
            this.bodyPosition = dir === 'ltr' ? 'right' : 'left';
        } else {
            this.bodyPosition = 'center';
        }
    }

    /**
     * Computes the position state based on the specified origin position. This is used if the
     * tab is becoming visible immediately after creation.
     */
    private computePositionFromOrigin(): McTabBodyPositionState {
        const dir = this.getLayoutDirection();

        if ((dir === 'ltr' && this.origin <= 0) || (dir === 'rtl' && this.origin > 0)) {
            return 'left-origin-center';
        }

        return 'right-origin-center';
    }
}

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
    selector: '[mcTabBodyHost]'
})
export class McTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
    /** Subscription to events for when the tab body begins centering. */
    private centeringSub = Subscription.EMPTY;
    /** Subscription to events for when the tab body finishes leaving from center position. */
    private leavingSub = Subscription.EMPTY;

    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => McTabBody)) private host: McTabBody) {
        super(componentFactoryResolver, viewContainerRef);
    }

    /** Set initial visibility or set up subscription for changing visibility. */
    ngOnInit(): void {
        super.ngOnInit();

        this.centeringSub = this.host.beforeCentering
            .pipe(startWith(this.host.isCenterPosition(this.host.bodyPosition)))
            .subscribe((isCentering: boolean) => {
                if (isCentering && !this.hasAttached()) {
                    this.attach(this.host.content);
                }
            });

        this.leavingSub = this.host.afterLeavingCenter.subscribe(() => {
            this.detach();
        });
    }

    /** Clean up centering subscription. */
    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.centeringSub.unsubscribe();
        this.leavingSub.unsubscribe();
    }
}
