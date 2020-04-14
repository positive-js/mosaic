import { AnimationEvent } from '@angular/animations';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Inject,
    InjectionToken,
    OnDestroy,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import {
    mcSidepanelAnimations,
    McSidepanelAnimationState,
    mcSidepanelTransformAnimation
} from './sidepanel-animations';
import { McSidepanelConfig, McSidepanelPosition } from './sidepanel-config';


export const MC_SIDEPANEL_WITH_INDENT =
    new InjectionToken<boolean>('mc-sidepanel-with-indent');

export const MC_SIDEPANEL_WITH_SHADOW =
    new InjectionToken<boolean>('mc-sidepanel-with-shadow');

@Component({
    selector: 'mc-sidepanel-container',
    templateUrl: './sidepanel-container.component.html',
    styleUrls: ['./sidepanel.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [mcSidepanelAnimations.sidepanelState],
    host: {
        class: 'mc-sidepanel-container',
        role: 'dialog',
        'aria-modal': 'true',
        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[@state]': `{
            value: animationState,
            params: animationTransform
        }`,
        '(@state.start)': 'onAnimation($event)',
        '(@state.done)': 'onAnimation($event)'
    }
})
export class McSidepanelContainerComponent extends BasePortalOutlet implements OnDestroy {
    /** ID for the container DOM element. */
    id: string;

    /** The portal outlet inside of this container into which the content will be loaded. */
    @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;

    /** The state of the sidepanel animations. */
    animationState: McSidepanelAnimationState = McSidepanelAnimationState.Void;

    animationTransform: { transformIn: string; transformOut: string };

    /** Emits whenever the state of the animation changes. */
    animationStateChanged = new EventEmitter<AnimationEvent>();

    /** Whether the component has been destroyed. */
    private destroyed: boolean;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        public sidepanelConfig: McSidepanelConfig,
        @Inject(MC_SIDEPANEL_WITH_INDENT) public withIndent: boolean,
        @Inject(MC_SIDEPANEL_WITH_SHADOW) public withShadow: boolean
    ) {
        super();
    }

    ngOnDestroy(): void {
        this.destroyed = true;
    }

    /** Attach a component portal as content to this sidepanel container. */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        this.validatePortalAttached();
        this.setAnimation();
        this.setPanelClass();

        return this.portalOutlet.attachComponentPortal(portal);
    }

    /** Attach a template portal as content to this sidepanel container. */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        this.validatePortalAttached();
        this.setAnimation();
        this.setPanelClass();

        return this.portalOutlet.attachTemplatePortal(portal);
    }

    /** Begin animation of the sidepanel entrance into view. */
    enter(): void {
        if (!this.destroyed) {
            this.animationState = McSidepanelAnimationState.Visible;
            this.changeDetectorRef.detectChanges();
        }
    }

    /** Begin animation of the sidepanel exiting from view. */
    exit(): void {
        if (!this.destroyed) {
            this.animationState = McSidepanelAnimationState.Hidden;
            this.changeDetectorRef.markForCheck();
        }
    }

    onAnimation(event: AnimationEvent) {
        this.animationStateChanged.emit(event);
    }

    private setAnimation() {
        const position: McSidepanelPosition = this.sidepanelConfig.position!;

        this.animationTransform = {
            transformIn: mcSidepanelTransformAnimation[position].in,
            transformOut: mcSidepanelTransformAnimation[position].out
        };
    }

    private setPanelClass() {
        const element: HTMLElement = this.elementRef.nativeElement;
        const position: McSidepanelPosition = this.sidepanelConfig.position!;

        element.classList.add(`mc-sidepanel-container_${position}`);

        if (this.withShadow) {
            element.classList.add('mc-sidepanel-container_shadowed');
        }
    }

    private validatePortalAttached() {
        if (this.portalOutlet.hasAttached()) {
            throw Error('Attempting to attach sidepanel content after content is already attached');
        }
    }
}
