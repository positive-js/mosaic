import { animate, AnimationTriggerMetadata, style, transition, trigger, state } from '@angular/animations';


export function expandVerticalNavbarAnimation(): AnimationTriggerMetadata {
    return trigger('expand', [
        state('0', style({
            width: '64px'
        })),
        state('1',  style({
            width: '*'
        })),
        transition('0 <=> 1', animate('300ms cubic-bezier(0, 1, 0.5, 1)'))
    ]);
}

export function expandVerticalNavbarMenuAnimation(): AnimationTriggerMetadata {
    return trigger('toggleMenu', [
        state('0', style({
            width: '0'
        })),
        state('1',  style({
            width: '*'
        })),
        transition('0 <=> 1', animate('200ms cubic-bezier(0, 1, 0.5, 1)'))
    ]);
}
