import {
    animate,
    style,
    transition,
    trigger,
    state,
    AnimationTriggerMetadata
} from '@angular/animations';


export const mcToastAnimations: {
    readonly toastState: AnimationTriggerMetadata;
} = {
    toastState: trigger('state', [
        state('void, hidden', style({ transform: 'scale(0.8)', opacity: 0, height: 0 })),
        state('visible', style({ transform: 'scale(1)', opacity: 1 })),
        transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
        transition(
            '* => void, * => hidden',
            animate(
                '100ms cubic-bezier(0.4, 0.0, 1, 1)',
                style({ height: 0, transform: 'scale(0)' }))
        )
    ])
};
