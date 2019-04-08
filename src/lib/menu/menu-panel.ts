import { EventEmitter, TemplateRef, InjectionToken } from '@angular/core';
import { FocusOrigin } from '@ptsecurity/cdk/a11y';
import { Direction } from '@ptsecurity/cdk/bidi';

import { MatMenuContent } from './menu-content';
import { MenuPositionX, MenuPositionY } from './menu-positions';


/**
 * Injection token used to provide the parent menu to menu-specific components.
 * @docs-private
 */
export const MAT_MENU_PANEL = new InjectionToken<MatMenuPanel>('MAT_MENU_PANEL');

/**
 * Interface for a custom menu panel that can be used with `matMenuTriggerFor`.
 * @docs-private
 */
export interface MatMenuPanel<T = any> {
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
    overlapTrigger: boolean;
    templateRef: TemplateRef<any>;
    close: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    parentMenu?: MatMenuPanel | undefined;
    direction?: Direction;
    focusFirstItem: (origin?: FocusOrigin) => void;
    resetActiveItem: () => void;
    setPositionClasses?: (x: MenuPositionX, y: MenuPositionY) => void;

    setElevation?(depth: number): void;

    lazyContent?: MatMenuContent;
    backdropClass?: string;
    hasBackdrop?: boolean;
    addItem?: (item: T) => void;
    removeItem?: (item: T) => void;
}
