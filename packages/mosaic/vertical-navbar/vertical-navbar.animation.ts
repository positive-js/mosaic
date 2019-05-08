import { animate, AnimationTriggerMetadata, style, transition, trigger, state } from '@angular/animations';


export function toggleVerticalNavbarAnimation(): AnimationTriggerMetadata {
    return trigger('toggle', [
        state('0', style({
            width: '64px'
        })),
        state('1',  style({
            width: '*'
        })),
        transition('0 <=> 1', animate('200ms cubic-bezier(0, 1, 0.5, 1)'))
    ]);
}
