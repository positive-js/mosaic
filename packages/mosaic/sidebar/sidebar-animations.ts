import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';


export enum McSidebarAnimationState {
    Opened = 'opened',
    Closed = 'closed'
}

export const mcSidebarAnimations: {
    readonly sidebarState: AnimationTriggerMetadata;
} = {
    sidebarState: trigger('state', [
        state('opened', style({ width: '{{ openedStateWidth }}' }),
            { params: { openedStateWidth: '' }}
        ),
        state('closed', style({ width: '{{ closedStateWidth }}' }),
            { params: { closedStateWidth: '' }}
        ),
        transition('opened => closed', [animate('0.1s')]),
        transition('closed => opened', [animate('0.2s')])
    ])
};
