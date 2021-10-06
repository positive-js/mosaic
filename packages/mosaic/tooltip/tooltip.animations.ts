import {
    animate,
    AnimationTriggerMetadata,
    keyframes,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';


/**
 * Animations used by McTooltip.
 * @docs-private
 */
export const mcTooltipAnimations: {
    readonly tooltipState: AnimationTriggerMetadata;
} = {
    /** Animation that transitions a tooltip in and out. */
    tooltipState: trigger('state', [
        state('initial, void, hidden', style({ opacity: 0, transform: 'scale(0)' })),
        state('visible', style({ transform: 'scale(1)' })),
        transition('* => visible', animate('200ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
            style({ opacity: 0.5, transform: 'scale(0.99)', offset: 0.5 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 1 })
        ]))),
        transition('* => hidden', animate('100ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 0 })))
    ])
};
