import { TemplateRef, InjectionToken } from '@angular/core';


export type McToastStyle = 'default' | 'confirm' | 'custom' | 'success' | 'error' | 'warning' | 'info';
export enum McToastPosition {
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    TOP_CENTER = 'top-center',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_CENTER = 'bottom-center',
    CENTER = 'center'
}

export class McToastData {
    style: McToastStyle;
    title: string | TemplateRef<any>;
    content?: string | TemplateRef<any>;

    hasDismiss?: boolean;
}

// tslint:disable-next-line:naming-convention
export interface McToastConfig {
    position: McToastPosition;
    duration: number;
    onTop: boolean;
    sticky: boolean;
}

export const MC_TOAST_CONFIG = new InjectionToken('mc-toast-config');
