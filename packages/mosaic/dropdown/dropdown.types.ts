import { FocusOrigin } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import {
    EventEmitter,
    InjectionToken,
    TemplateRef
} from '@angular/core';

import { McDropdownContent } from './dropdown-content.directive';


export type DropdownPositionX = 'before' | 'after';

export type DropdownPositionY = 'above' | 'below';

/**
 * Interface for a custom dropdown panel that can be used with `mcDropdownTriggerFor`.
 * @docs-private
 */
// tslint:disable-next-line:naming-convention
export interface McDropdownPanel<T = any> {
    xPosition: DropdownPositionX;
    yPosition: DropdownPositionY;
    overlapTriggerX: boolean;
    overlapTriggerY: boolean;
    templateRef: TemplateRef<any>;
    closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    parent?: McDropdownPanel | undefined;
    direction?: Direction;
    lazyContent?: McDropdownContent;
    backdropClass?: string;
    hasBackdrop?: boolean;
    focusFirstItem(origin?: FocusOrigin): void;
    resetActiveItem(): void;
    setPositionClasses?(x: DropdownPositionX, y: DropdownPositionY): void;
    addItem?(item: T): void;
    removeItem?(item: T): void;
}


/** Default `mc-dropdown` options that can be overridden. */
// tslint:disable-next-line:naming-convention
export interface McDropdownDefaultOptions {
    /** The x-axis position of the dropdown. */
    xPosition: DropdownPositionX;

    /** The y-axis position of the dropdown. */
    yPosition: DropdownPositionY;

    /** Whether the dropdown should overlap the dropdown trigger horizontally. */
    overlapTriggerX: boolean;

    /** Whether the dropdown should overlap the dropdown trigger vertically. */
    overlapTriggerY: boolean;

    /** Class to be applied to the dropdown's backdrop. */
    backdropClass: string;

    /** Whether the dropdown has a backdrop. */
    hasBackdrop: boolean;
}

/**
 * Injection token used to provide the parent dropdown to dropdown-specific components.
 * @docs-private
 */
export const MC_DROPDOWN_PANEL = new InjectionToken<McDropdownPanel>('MC_DROPDOWN_PANEL');


/** Injection token to be used to override the default options for `mc-dropdown`. */
export const MC_DROPDOWN_DEFAULT_OPTIONS =
    new InjectionToken<McDropdownDefaultOptions>('mc-dropdown-default-options', {
        providedIn: 'root',
        factory: MC_DROPDOWN_DEFAULT_OPTIONS_FACTORY
    });

/** @docs-private */
// tslint:disable-next-line:naming-convention
export function MC_DROPDOWN_DEFAULT_OPTIONS_FACTORY(): McDropdownDefaultOptions {
    return {
        overlapTriggerX: true,
        overlapTriggerY: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        hasBackdrop: false
    };
}
