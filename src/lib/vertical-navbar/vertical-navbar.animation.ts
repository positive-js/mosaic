import { animate, AnimationTriggerMetadata, style, transition, trigger, state } from '@angular/animations';


export function expandVerticalNavbarAnimation(): AnimationTriggerMetadata {
    return trigger('expand', [
        state('0', style({
            width: '64px'
        })),
        state('1',  style({
            width: '*'
        })),
        transition('0 => 1', animate('250ms cubic-bezier(0, 1, 0.5, 1)')),
        transition('1 => 0', animate('500ms cubic-bezier(0, 1, 0, 1)'))
    ]);
}
