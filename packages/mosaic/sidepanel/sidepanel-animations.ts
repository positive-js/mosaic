import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { AnimationCurves } from '@ptsecurity/mosaic/core';

import { McSidepanelPosition } from './sidepanel-config';


export enum McSidepanelAnimationState {
    Void = 'void',
    Visible = 'visible',
    Hidden = 'hidden'
}

// TODO Find a way to use dynamic keys and avoid error "Expression form not supported."
// tslint:disable-next-line
export const mcSidepanelTransformAnimation: Record<McSidepanelPosition, { in: string; out: string }> = {
    right: { in: 'translateX(100%)', out: 'translateX(0%)' },
    left: { in: 'translateX(-100%)', out: 'translateX(0%)' },
    top: { in: 'translateY(-100%)', out: 'translateY(0%)' },
    bottom: { in: 'translateY(100%)', out: 'translateY(0%)' }
};

export const mcSidepanelAnimations: { readonly sidepanelState: AnimationTriggerMetadata } = {
    sidepanelState: trigger('state', [
        state(
            'hidden',
            style({ transform: '{{transformIn}}' }),
            { params: { transformIn: mcSidepanelTransformAnimation[McSidepanelPosition.Right].in }}
        ),
        state(
            'visible',
            style({ transform: '{{transformOut}}' }),
            { params: { transformOut: mcSidepanelTransformAnimation[McSidepanelPosition.Right].out }}
        ),
        transition(
            'visible => void, visible => hidden',
            animate(`200ms ${AnimationCurves.AccelerationCurve}`)
        ),
        transition(
            'void => visible',
            animate(`200ms ${AnimationCurves.DecelerationCurve}`)
        )
    ])
};
