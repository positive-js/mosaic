import { EventEmitter, TemplateRef, Type } from '@angular/core';

import { OverlayRef } from '@ptsecurity/cdk/overlay';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);

// Different modal styles we have supported
export type ModalType = 'default' | 'confirm';

// Subtypes of Confirm Modal
export type ConfirmType = 'confirm' | 'success' | 'warn';

// Public options for using by service
export interface IModalOptions<T = any, R = any> {
    mcModalType?: ModalType;
    mcVisible?: boolean;
    mcZIndex?: number;
    mcWidth?: number | string;
    mcWrapClassName?: string;
    mcClassName?: string;
    mcStyle?: object;
    mcTitle?: string | TemplateRef<{}>;
    mcContent?: string | TemplateRef<{}> | Type<T>;
    mcComponentParams?: object;
    mcClosable?: boolean;
    mcMask?: boolean;
    mcMaskClosable?: boolean;
    mcMaskStyle?: object;
    mcBodyStyle?: object;
    mcFooter?: string | TemplateRef<{}> | IModalButtonOptions<T>[]; // Default Modal ONLY
    mcGetContainer?: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) | null; // STATIC
    mcAfterOpen?: EventEmitter<void>;
    mcAfterClose?: EventEmitter<R>;
    mcCloseByESC?: boolean;

    // --- Predefined OK & Cancel buttons
    mcOkText?: string;
    mcOkType?: string;
    mcOkLoading?: boolean;
    mcOnOk?: EventEmitter<T> | OnClickCallback<T>;
    mcCancelText?: string;
    mcCancelLoading?: boolean;
    mcOnCancel?: EventEmitter<T> | OnClickCallback<T>;
}

// tslint:disable-next-line:no-any
export interface IModalOptionsForService<T = any> extends IModalOptions<T> {
    mcOnOk?: OnClickCallback<T>;
    mcOnCancel?: OnClickCallback<T>;
}

export interface IModalButtonOptions<T = any> {
    label: string;
    // tslint:disable-next-line
    type?: string;
    shape?: string;
    ghost?: boolean;
    size?: string;
    // Default: true, indicate whether show loading automatically while onClick returned a Promise
    autoLoading?: boolean;

    // [NOTE] "componentInstance" will refer to the component's instance when using Component
    show?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    loading?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);
    disabled?: boolean | ((this: IModalButtonOptions<T>, contentComponentInstance?: T) => boolean);

    onClick?(this: IModalButtonOptions<T>, contentComponentInstance?: T): (void | {}) | Promise<(void | {})>;
}
