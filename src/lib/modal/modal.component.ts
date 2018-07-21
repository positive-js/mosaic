import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    Component, ComponentFactoryResolver, ComponentRef, ElementRef,
    EventEmitter, Inject, Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit, Output, Renderer2, SimpleChanges,
    TemplateRef,
    Type, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { Overlay, OverlayRef } from '@ptsecurity/cdk/overlay';
import { Observable } from 'rxjs';

import { McMeasureScrollbarService } from '../core/services/measure-scrollbar.service';

import { McModalRef } from './modal-abstr-ref.class';
import { McModalControlService } from './modal-control.service';
import { IModalOptions, ModalType, OnClickCallback } from './modal.types';
/* tslint:disable:import-name */
import ModalUtil from './utils';


export const MODAL_ANIMATE_DURATION = 200;

type AnimationState = 'enter' | 'leave' | null;

@Component({
    selector   : 'mc-modal',
    templateUrl: './modal.component.html'
})
export class McModalComponent<T = any, R = any> extends McModalRef<T, R> implements OnInit,
    OnChanges, AfterViewInit, OnDestroy, IModalOptions {
    /* tslint:disable:member-ordering */

    maskAnimationClassMap: object;
    modalAnimationClassMap: object;
    transformOrigin = '0px 0px 0px'; // The origin point that animation based on

    @Input() mcOkText: string;

    get okText(): string {
        return this.mcOkText;
    }

    @Input() mcZIndex: number = 1000;
    @Input() mcWidth: number | string = 520;
    @Input() mcTitle: string | TemplateRef<{}>;

    @Input() mcOkType = 'primary';
    @Input() mcOkLoading: boolean = false;
    @Input() @Output() mcOnOk: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();
    // Only aim to focus the ok button that needs to be auto focused
    @ViewChild('autoFocusButtonOk', { read: ElementRef }) autoFocusButtonOk: ElementRef;

    @Input() mcCancelText: string;
    // Trigger when modal open(visible) after animations
    @Output() mcAfterOpen = new EventEmitter<void>();
    @Output() mcAfterClose = new EventEmitter<R>();
    get afterOpen(): Observable<void> { // Observable alias for mcAfterOpen
        return this.mcAfterOpen.asObservable();
    }

    get afterClose(): Observable<R> { // Observable alias for mcAfterClose
        return this.mcAfterClose.asObservable();
    }

    @Input() mcCancelLoading: boolean = false;
    @Input() @Output() mcOnCancel: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();
    @ViewChild('modalContainer') modalContainer: ElementRef;
    @ViewChild('bodyContainer', { read: ViewContainerRef }) bodyContainer: ViewContainerRef;

    get cancelText(): string {
        return this.mcCancelText;
    }

    get hidden(): boolean {
        return !this.mcVisible && !this.animationState;
    } // Indicate whether this dialog should hidden

    @Input() mcModalType: ModalType = 'default';
    @Input() mcContent: string | TemplateRef<{}> | Type<T>;
    @Input() mcComponentParams: object;
    @Input() mcGetContainer: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) = () => this.overlay.create();

    @Input() mcVisible: boolean = false;
    @Output() mcVisibleChange = new EventEmitter<boolean>();

    private contentComponentRef: ComponentRef<T>; // Handle the reference when using mcContent as Component
    private animationState: AnimationState; // Current animation state
    private container: HTMLElement | OverlayRef;

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private viewContainer: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private modalControl: McModalControlService,
        private renderer: Renderer2,
        private mcMeasureScrollbarService: McMeasureScrollbarService,
        @Inject(DOCUMENT) private document: any
    ) {
        super();
    }

    ngOnInit(): void {

        if (this.isComponent(this.mcContent)) {
            this.createDynamicComponent(this.mcContent as Type<T>); // Create component along without View
        }

        // Place the modal dom to elsewhere
        this.container = typeof this.mcGetContainer === 'function' ? this.mcGetContainer() : this.mcGetContainer;
        if (this.container instanceof HTMLElement) {
            this.container.appendChild(this.elementRef.nativeElement);
        } else if (this.container instanceof OverlayRef) {
            // NOTE: only attach the dom to overlay, the view container is not changed actually
            this.container.overlayElement.appendChild(this.elementRef.nativeElement);
        }

        this.modalControl.registerModal(this);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.nzVisible) {
            // Do not trigger animation while initializing
            this.handleVisibleStateChange(this.mcVisible, !changes.nzVisible.firstChange);
        }
    }

    ngAfterViewInit(): void {
        // If using Component, it is the time to attach View while bodyContainer is ready
        if (this.contentComponentRef) {
            this.bodyContainer.insert(this.contentComponentRef.hostView);
        }

        if (this.autoFocusButtonOk) {
            (this.autoFocusButtonOk.nativeElement as HTMLButtonElement).focus();
        }
    }

    ngOnDestroy(): void {
        if (this.container instanceof OverlayRef) {
            this.container.dispose();
        }
    }

    open(): void {
        this.changeVisibleFromInside(true);
    }

    close(result?: R): void {
        this.changeVisibleFromInside(false, result);
    }

    destroy(result?: R): void { // Destroy equals Close
        this.close(result);
    }

    triggerOk(): void {
        this.onClickOkCancel('ok');
    }

    triggerCancel(): void {
        this.onClickOkCancel('cancel');
    }

    getInstance(): McModalComponent {
        return this;
    }

    getContentComponentRef(): ComponentRef<T> {
        return this.contentComponentRef;
    }

    getContentComponent(): T {
        return this.contentComponentRef && this.contentComponentRef.instance;
    }

    getElement(): HTMLElement {
        return this.elementRef && this.elementRef.nativeElement;
    }

    private onClickOkCancel(_type: 'ok' | 'cancel'): void {
        /* tslint:disable:object-literal-key-quotes */
        const trigger = { 'ok': this.mcOnOk, 'cancel': this.mcOnCancel }[ _type ];
        const loadingKey = { 'ok': 'mcOkLoading', 'cancel': 'mcCancelLoading' }[ _type ];
        if (trigger instanceof EventEmitter) {
            trigger.emit(this.getContentComponent());
        } else if (typeof trigger === 'function') {
            const result = trigger(this.getContentComponent());

            // Users can return "false" to prevent closing by default
            const caseClose = (doClose: boolean | void | {}) => (doClose !== false) && this.close(doClose as R);
            if (isPromise(result)) {
                this[ loadingKey ] = true;
                const handleThen = (doClose) => {
                    this[ loadingKey ] = false;
                    caseClose(doClose);
                };
                (result as Promise<void>).then(handleThen).catch(handleThen);
            } else {
                caseClose(result);
            }
        }
    }

    private changeVisibleFromInside(visible: boolean, closeResult?: R): Promise<void> {
        if (this.mcVisible !== visible) {
            // Change mcVisible value immediately
            this.mcVisible = visible;
            this.mcVisibleChange.emit(visible);

            return this.handleVisibleStateChange(visible, true, closeResult);
        }

        return Promise.resolve();
    }

    private createDynamicComponent(component: Type<T>): void {
        const factory = this.cfr.resolveComponentFactory(component);
        const childInjector = Injector.create({
            providers: [ { provide: McModalRef, useValue: this } ],
            parent   : this.viewContainer.parentInjector
        });
        this.contentComponentRef = factory.create(childInjector);
        if (this.mcComponentParams) {
            Object.assign(this.contentComponentRef.instance, this.mcComponentParams);
        }

        // Do the first change detection immediately
        // (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
        this.contentComponentRef.changeDetectorRef.detectChanges();
    }

    // Update transform-origin to the last click position on document
    private updateTransformOrigin(): void {
        const modalElement = this.modalContainer.nativeElement as HTMLElement;
        const lastPosition = ModalUtil.getLastClickPosition();

        if (lastPosition) {
            /* tslint:disable:max-line-length */
            this.transformOrigin = `${lastPosition.x - modalElement.offsetLeft}px ${lastPosition.y - modalElement.offsetTop}px 0px`;
        }
    }

    private changeAnimationState(state: AnimationState): void {
        this.animationState = state;
        if (state) {
            this.maskAnimationClassMap = {
                [ `fade-${state}` ]       : true,
                [ `fade-${state}-active` ]: true
            };
            this.modalAnimationClassMap = {
                [ `zoom-${state}` ]       : true,
                [ `zoom-${state}-active` ]: true
            };
        } else {
            // @ts-ignore
            this.maskAnimationClassMap = this.modalAnimationClassMap = null;
        }
    }

    private animateTo(isVisible: boolean): Promise<void> {
        // Figure out the latest click position when shows up
        if (isVisible) {
            // [NOTE] Using timeout due to the document.click event is fired later than visible change,
            // so if not postponed to next event-loop, we can't get the lastest click position
            window.setTimeout(() => this.updateTransformOrigin());
        }

        this.changeAnimationState(isVisible ? 'enter' : 'leave');

        return new Promise((resolve) => window.setTimeout(() => { // Return when animation is over
            this.changeAnimationState(null);
            resolve();
        }, MODAL_ANIMATE_DURATION));
    }

    // Do rest things when visible state changed
    private handleVisibleStateChange(visible: boolean, animation: boolean = true, closeResult?: R): Promise<void> {
        if (visible) { // Hide scrollbar at the first time when shown up
            this.changeBodyOverflow(1);
        }

        return Promise
            .resolve(animation && this.animateTo(visible))
            .then(() => { // Emit open/close event after animations over
                if (visible) {
                    this.mcAfterOpen.emit();
                } else {
                    this.mcAfterClose.emit(closeResult);
                    this.changeBodyOverflow(); // Show/hide scrollbar when animation is over
                }
            });
    }

    private changeBodyOverflow(plusNum: number = 0): void {
        const openModals = this.modalControl.openModals;

        if (openModals.length + plusNum > 0) {
            this.renderer.setStyle(this.document.body, 'padding-right', `${this.mcMeasureScrollbarService.scrollBarWidth}px`);
            this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
        } else {
            this.renderer.removeStyle(this.document.body, 'padding-right');
            this.renderer.removeStyle(this.document.body, 'overflow');
        }
    }

    private isComponent(value: {}): boolean {
        return value instanceof Type;
    }
}

function isPromise(obj: {} | void): boolean {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof (obj as Promise<{}>).then === 'function' && typeof (obj as Promise<{}>).catch === 'function';
}
