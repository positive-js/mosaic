import { AnimationTriggerMetadata, trigger, state, transition, style, animate } from '@angular/animations';


export const toastAnimations: {
    readonly toastState: AnimationTriggerMetadata;
} = {
    toastState: trigger('state', [
        state('default', style({
           opacity: 1
        })),
        transition(
            'void => *',
            [
                style({ opacity: 0 }),
                animate('120ms cubic-bezier(0.0, 0.0, 0.2, 1)')
            ]
        ),
        transition(
            'default => closing',
            animate('120ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0 }))
        )
    ])
};

export type ToastAnimationState = 'default' | 'closing';
