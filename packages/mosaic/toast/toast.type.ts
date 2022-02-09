import { TemplateRef, Type, EventEmitter, InjectionToken } from '@angular/core';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);
export type McToastType = 'default' | 'confirm' | 'custom' | 'success' | 'error' | 'warning' | 'info';
export enum ToastPosition {
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    TOP_CENTER = 'top-center',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_CENTER = 'bottom-center',
    CENTER = 'center'
}

export interface IToastOptions<T> {
    severity: McToastType;
    title?: string | TemplateRef<{}>;
    content?: string | TemplateRef<{}> | Type<T>;
    component?: Type<T>;
    componentParams?: Partial<T>;
    wrapClassName?: string;
    className?: string;
    style?: object;
    sticky: boolean;
    position: ToastPosition;
    preventDuplicates: boolean;
    duration: number;
    easing: string;
    easeTime: number;
    newOnTop: boolean;
    onClose?: EventEmitter<T> | OnClickCallback<T>;
}

export class ToastData {
    severity: McToastType;
    title: string;
    content: string;
    template?: TemplateRef<any>;
}

// tslint:disable-next-line:naming-convention
export interface ToastConfig {
    position: ToastPosition;
    duration: number;
    newOnTop: boolean;
}

export const MC_TOAST_CONFIG = new InjectionToken('mc-toast-config');
