import { TemplateRef, Type, EventEmitter, InjectionToken } from '@angular/core';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);
export type ToastType = 'default' | 'confirm' | 'custom' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center';

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
    position: {
        top: number;
        right: number;
    };
    animation: {
        fadeOut: number;
        fadeIn: number;
    };
}

export const defaultToastConfig: IToastConfig = {
    position: {
        top: 20,
        right: 20
    },
    animation: {
        fadeOut: 2500,
        fadeIn: 300
    }
};

export const TOAST_CONFIG_TOKEN = new InjectionToken('toast-config');
