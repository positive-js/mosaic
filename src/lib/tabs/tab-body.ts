import { AnimationEvent } from '@angular/animations';
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
import { Directionality, Direction } from '@ptsecurity/cdk/bidi';
import { TemplatePortal, CdkPortalOutlet, PortalHostDirective } from '@ptsecurity/cdk/portal';
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
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
  selector: '[mcTabBodyHost]'
})
export class McTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
  /** Subscription to events for when the tab body begins centering. */
  private _centeringSub = Subscription.EMPTY;
  /** Subscription to events for when the tab body finishes leaving from center position. */
  private _leavingSub = Subscription.EMPTY;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => McTabBody)) private _host: McTabBody) {
    super(componentFactoryResolver, viewContainerRef);
  }

  /** Set initial visibility or set up subscription for changing visibility. */
  ngOnInit(): void {
    super.ngOnInit();

    this._centeringSub = this._host._beforeCentering
      .pipe(startWith(this._host._isCenterPosition(this._host._position)))
      .subscribe((isCentering: boolean) => {
        if (isCentering && !this.hasAttached()) {
          this.attach(this._host._content);
        }
      });

    this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
      this.detach();
    });
  }

  /** Clean up centering subscription. */
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._centeringSub.unsubscribe();
    this._leavingSub.unsubscribe();
  }
}

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  selector: 'mc-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.css'],
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
    this._positionIndex = position;
    this._computePositionAnimationState();
  }

  /** Tab body position state. Used by the animation trigger for the current state. */
  _position: McTabBodyPositionState;

  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output() readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted before the centering of the tab begins. */
  @Output() readonly _beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted before the centering of the tab begins. */
  @Output() readonly _afterLeavingCenter: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output() readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** The portal host inside of this container into which the tab body content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The tab body content to display. */
  @Input('content') _content: TemplatePortal;

  /** Position that will be used when the tab is immediately becoming visible after creation. */
  @Input() origin: number;

  // Note that the default value will always be overwritten by `McTabBody`, but we need one
  // anyway to prevent the animations module from throwing an error if the body is used on its own.
  /** Duration for the tab's animation. */
  @Input() animationDuration: string = '500ms';

  /** Current position of the tab-body in the tab-group. Zero means that the tab is visible. */
  private _positionIndex: number;

  /** Subscription to the directionality change observable. */
  private _dirChangeSubscription = Subscription.EMPTY;

  constructor(private _elementRef: ElementRef<HTMLElement>,
              @Optional() private _dir: Directionality,
    /**
     * @breaking-change 8.0.0 changeDetectorRef to be made required.
     */
              changeDetectorRef?: ChangeDetectorRef) {

    if (this._dir && changeDetectorRef) {
      this._dirChangeSubscription = this._dir.change.subscribe((dir: Direction) => {
        this._computePositionAnimationState(dir);
        changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * After initialized, check if the content is centered and has an origin. If so, set the
   * special position states that transition the tab from the left or right before centering.
   */
  ngOnInit() {
    if (this._position === 'center' && this.origin != null) {
      this._position = this._computePositionFromOrigin();
    }
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
  }

  _onTranslateTabStarted(e: AnimationEvent): void {
    const isCentering = this._isCenterPosition(e.toState);
    this._beforeCentering.emit(isCentering);
    if (isCentering) {
      this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  _onTranslateTabComplete(e: AnimationEvent): void {
    // If the transition to the center is complete, emit an event.
    if (this._isCenterPosition(e.toState) && this._isCenterPosition(this._position)) {
      this._onCentered.emit();
    }

    if (this._isCenterPosition(e.fromState) && !this._isCenterPosition(this._position)) {
      this._afterLeavingCenter.emit();
    }
  }

  /** The text direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the provided position state is considered center, regardless of origin. */
  _isCenterPosition(position: McTabBodyPositionState | string): boolean {
    return position === 'center' ||
      position === 'left-origin-center' ||
      position === 'right-origin-center';
  }

  /** Computes the position state that will be used for the tab-body animation trigger. */
  private _computePositionAnimationState(dir: Direction = this._getLayoutDirection()) {
    if (this._positionIndex < 0) {
      this._position = dir === 'ltr' ? 'left' : 'right';
    } else if (this._positionIndex > 0) {
      this._position = dir === 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }
  }

  /**
   * Computes the position state based on the specified origin position. This is used if the
   * tab is becoming visible immediately after creation.
   */
  private _computePositionFromOrigin(): McTabBodyPositionState {
    const dir = this._getLayoutDirection();

    if ((dir === 'ltr' && this.origin <= 0) || (dir === 'rtl' && this.origin > 0)) {
      return 'left-origin-center';
    }

    return 'right-origin-center';
  }
}
