import { EventEmitter, TemplateRef } from '@angular/core';
import { Type } from '@angular/core/src/type';
import { OverlayRef } from '@ptsecurity/cdk/overlay';


export type OnClickCallback<T> = ((instance: T) => (false | void | {}) | Promise<false | void | {}>);

export type ConfirmType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

export type ModalType = 'default' | 'confirm';

export interface IModalOptions<T = any, R = any> {
    mcModalType?: ModalType;
    mcVisible?: boolean;
    mcZIndex?: number;
    mcWidth?: number | string;
    mcClassName?: string;
    mcTitle?: string | TemplateRef<{}>;
    mcContent?: string | TemplateRef<{}> | Type<T>;
    mcMaskClosable?: boolean;
    mcGetContainer?: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef);
    mcAfterOpen?: EventEmitter<void>;
    mcAfterClose?: EventEmitter<R>;

    mcOkText?: string;
    mcOkType?: string;
    mcOkLoading?: boolean;
    mcOnOk?: EventEmitter<T> | OnClickCallback<T>;
    mcCancelText?: string;
    mcCancelLoading?: boolean;
    mcOnCancel?: EventEmitter<T> | OnClickCallback<T>;
}

export interface IModalOptionsForService<T = any> extends IModalOptions<T> {
    mcOnOk?: OnClickCallback<T>;
    mcOnCancel?: OnClickCallback<T>;
}
