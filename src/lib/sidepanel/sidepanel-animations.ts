import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { AnimationCurves, AnimationDurations } from '@ptsecurity/mosaic/core/animation/animation';
import { McSidepanelPosition } from '@ptsecurity/mosaic/sidepanel/sidepanel-config';


export enum McSidepanelAnimationState {
    Void = 'void',
    Visible = 'visible',
    Hidden = 'hidden'
}

export const mcSidepanelTransformAnimation = {
    [McSidepanelPosition.Right]: { in: 'translateX(100%)', out: 'translateX(0%)' },
    [McSidepanelPosition.Left]: { in: 'translateX(-100%)', out: 'translateX(0%)' },
    [McSidepanelPosition.Top]: { in: 'translateY(-100%)', out: 'translateY(0%)' },
    [McSidepanelPosition.Bottom]: { in: 'translateY(100%)', out: 'translateY(0%)' }
};

export const mcSidepanelAnimations: {
    readonly sidepanelState: AnimationTriggerMetadata;
} = {
    sidepanelState: trigger('state', [
        state('hidden',
            style({ transform: '{{transformIn}}' }),
            { params: { transformIn: mcSidepanelTransformAnimation[McSidepanelPosition.Right].in }}
        ),
        state('visible',
            style({ transform: '{{transformOut}}' }),
            { params: { transformOut: mcSidepanelTransformAnimation[McSidepanelPosition.Right].out }}
        ),
        transition('visible => void, visible => hidden',
            animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`)),
        transition('void => visible',
            animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`))
    ])
};
