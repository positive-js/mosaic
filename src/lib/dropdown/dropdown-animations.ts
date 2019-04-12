import {
    trigger,
    state,
    style,
    animate,
    transition,
    query,
    group,
    AnimationTriggerMetadata
} from '@angular/animations';


/**
 * Animations used by the mc-dropdown component.
 * @docs-private
 */
export const mcDropdownAnimations: {
    readonly transformDropdown: AnimationTriggerMetadata;
    readonly fadeInItems: AnimationTriggerMetadata;
} = {
    /**
     * This animation controls the dropdown panel's entry and exit from the page.
     *
     * When the dropdown panel is added to the DOM, it scales in and fades in its border.
     *
     * When the dropdown panel is removed from the DOM, it simply fades out after a brief
     * delay to display the ripple.
     */
    transformDropdown: trigger('transformDropdown', [
        state('void', style({
            opacity: 0,
            transform: 'scale(0.8)'
        })),
        transition('void => enter', group([
            query('.mc-dropdown__content', animate('50ms linear', style({opacity: 1}))),
            animate('50ms cubic-bezier(0, 0, 0.2, 1)', style({transform: 'scale(1)'}))
        ])),
        transition('* => void', animate('50ms 25ms linear', style({opacity: 0})))
    ]),


    /**
     * This animation fades in the background color and content of the dropdown panel
     * after its containing element is scaled in.
     */
    fadeInItems: trigger('fadeInItems', [
        // now. Remove next time we do breaking changes.
        state('showing', style({opacity: 1})),
        transition('void => *', [
            style({opacity: 0}),
            animate('200ms 60ms cubic-bezier(0.55, 0, 0.55, 0.2)')
        ])
    ])
};

export const fadeInItems = mcDropdownAnimations.fadeInItems;

export const transformDropdown = mcDropdownAnimations.transformDropdown;
