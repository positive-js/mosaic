import { TemplateRef, Type, EventEmitter, InjectionToken } from '@angular/core';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);
export type ToastType = 'default' | 'confirm' | 'custom' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';

export interface IToastOptions<T = any> {
    mcToastType: ToastType;
    mcTitle?: string | TemplateRef<{}>;
    mcContent?: string | TemplateRef<{}> | Type<T>;
    mcComponent?: Type<T>;
    mcComponentParams?: Partial<T>;
    mcWrapClassName?: string;
    mcClassName?: string;
    mcStyle?: object;
    mcSticky: boolean;
    mcPosition: ToastPosition;
    mcPreventDuplicates: boolean;
    mcDuration: number;
    mcEasing: string;
    mcEaseTime: number;

    mcOnClose?: EventEmitter<T> | OnClickCallback<T>;
}

export class ToastData {
    severity?: ToastType;
    title?: string;
    content?: string;
    template?: TemplateRef<any>;
    templateContext?: {};
}

export interface IToastConfig {
    position?: ToastPosition;
    animationOut?: number;
    animationIn?: number;
    duration?: number;
}

export const defaultToastConfig: IToastConfig = {
    position: 'top-center',
    animationOut: 2500,
    animationIn: 300,
    duration: 4000
};

export const TOAST_CONFIG_TOKEN = new InjectionToken('toast-config');
