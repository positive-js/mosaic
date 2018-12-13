/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
import { InjectionToken } from '@angular/core';


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

    position: McSidepanelPosition = McSidepanelPosition.Right;

    /** Whether the sidepanel has a backdrop. */
    hasBackdrop?: boolean = true;

    /** Whether the user can use escape or clicking outside to close the sidepanel. */
    disableClose?: boolean = false;
}
