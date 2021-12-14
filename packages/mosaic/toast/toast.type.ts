import { TemplateRef, Type, EventEmitter, InjectionToken } from '@angular/core';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);
export type ToastType = 'default' | 'confirm' | 'custom' | 'success' | 'error' | 'warning' | 'info';
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
    toastType: ToastType;
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
    id?: number;
    severity?: ToastType;
    title?: string;
    content?: string;
    template?: TemplateRef<any>;
    templateContext?: {};
}

export interface IToastConfig {
    position: ToastPosition;
    animationOut?: number;
    animationIn?: number;
    duration?: number;
}

export const defaultToastConfig: IToastConfig = {
    position: ToastPosition.CENTER,
    animationOut: 2500,
    animationIn: 300,
    duration: 4000
};

export const TOAST_CONFIG_TOKEN = new InjectionToken('toast-config');
