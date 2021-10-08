import { InjectionToken } from '@angular/core';


/** Injection token that can be used to access the data that was passed in to a sidepanel. */
export const MC_SIDEPANEL_DATA = new InjectionToken<any>('McSidepanelData');

export enum McSidepanelPosition {
    Right = 'right',
    Left = 'left',
    Top = 'top',
    Bottom = 'bottom'
}

export class McSidepanelConfig<D = any> {
    /** ID for the sidepanel. If omitted, a unique one will be generated. */
    id?: string;

    /** Data being injected into the child component. */
    data?: D | null = null;

    position?: McSidepanelPosition = McSidepanelPosition.Right;

    /** Whether the sidepanel has a backdrop. */
    hasBackdrop?: boolean = true;

    backdropClass?: string;

    /** When we open multiple sidepanels, backdrop appears only once, except cases then this flag is true. */
    requiredBackdrop?: boolean = false;

    /** Whether the user can use escape or clicking outside to close the sidepanel. */
    disableClose?: boolean = false;

    /** Custom class for the overlay pane. */
    overlayPanelClass?: string | string[] = '';
}
