import { query, style, trigger, animate, transition, stagger } from '@angular/animations';
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Directive,
    Inject,
    Injector,
    ViewChild,
    ViewContainerRef,
    ViewRef
} from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { IToastConfig, TOAST_CONFIG_TOKEN, ToastData } from './toast.type';


const ENTER_QUERY_TIMING = 50;

@Directive({ selector: '[mcToastOutlet]' })
export class McToastOutlet {
    constructor(public viewContainer: ViewContainerRef, public changeDetectorRef: ChangeDetectorRef) {}
}


@Component({
    selector: 'mc-toast-container',
    template: `
        <div class="mc-toast__container" [@animate]="containerLength">
            <ng-container mcToastOutlet></ng-container>
        </div>`,
    animations: [
       trigger('animate', [
           transition(':enter, * => 0, * => -1', []),
           transition(':increment', [
               query(':enter', [
                   style({ opacity: 0 }),
                   stagger(ENTER_QUERY_TIMING, [
                       animate('300ms ease-out', style({ opacity: 1, width: '*' }))
                   ])
               ],    { optional: true })
           ]),
           transition(':decrement', [
               query(':leave', [
                   animate('120ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0 }))
               ],    { optional: true })
           ])
       ])
    ]
})
export class ToastContainerComponent {
    @ViewChild(McToastOutlet, { static: true, read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private toastService: ToastService,
        private injector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {}

    createToast(data: ToastData): ComponentRef<ToastComponent> {
        const injector = this.getInjector(data);
        const index = this.toastConfig.newOnTop ? 0 : undefined;

        return this.container.createComponent(ToastComponent, { injector, index });
    }

    deleteToast(viewRef: ViewRef) {
        if (this.container.length === 0) { return; }

        // const componentRef = this.toastService.componentsRef.filter((x) => x.instance.index === index)[0];
        const vcrIndex: number = this.container.indexOf(viewRef);
        this.container.remove(vcrIndex);
        // this.toastService.componentsRef = this.toastService.componentsRef.filter((x) => x.instance.index !== index);
    }

    getInjector(data: ToastData): Injector {
        return Injector.create({
            providers: [
                { provide: ToastData, useValue: data },
                { provide: ToastService, useValue: this.toastService },
                { provide: ToastContainerComponent, useValue: this }
            ],
            parent: this.injector
        });
    }

    get containerLength(): number {
        return this.toastService.componentsRef.length;
    }
}
