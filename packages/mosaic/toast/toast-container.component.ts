import { query, style, trigger, animate, transition, stagger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Directive,
    Inject,
    Injector,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';

import { McToastComponent } from './toast.component';
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
        <div class="mc-toast__container" [@animate]="container.length">
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
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McToastContainerComponent {
    @ViewChild(McToastOutlet, { static: true, read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private service: ToastService,
        private injector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    createToast<C>(data: ToastData): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = this.toastConfig.newOnTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

        return this.container.createComponent(McToastComponent, { injector, index }) as unknown as ComponentRef<C>;
    }

    deleteToast(viewRef: ViewRef) {
        const index = this.container.indexOf(viewRef);

        if (index < 0) { return; }

        this.container.remove(index);
    }

    getInjector(data: ToastData): Injector {
        return Injector.create({
            providers: [
                { provide: ToastData, useValue: data },
                { provide: ToastService, useValue: this.service }
            ],
            parent: this.injector
        });
    }
}
