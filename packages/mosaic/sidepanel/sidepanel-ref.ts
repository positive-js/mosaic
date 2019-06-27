import { OverlayRef } from '@angular/cdk/overlay';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { merge, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { McSidepanelAnimationState } from './sidepanel-animations';
import { McSidepanelConfig } from './sidepanel-config';
import { McSidepanelContainerComponent } from './sidepanel-container.component';


// Counter for unique sidepanel ids.
let uniqueId = 0;

export class McSidepanelRef<T = any, R = any> {
    readonly id: string;

    /** Instance of the component making up the content of the sidepanel. */
    instance: T;

    /** Subject for notifying the user that the sidepanel has been closed and dismissed. */
    private readonly afterClosed$ = new Subject<R | undefined>();

    /** Subject for notifying the user that the sidepanel has opened and appeared. */
    private readonly afterOpened$ = new Subject<void>();

    /** Result to be passed down to the `afterDismissed` stream. */
    private result: R | undefined;

    constructor(
        public containerInstance: McSidepanelContainerComponent,
        private overlayRef: OverlayRef,
        public config: McSidepanelConfig) {

        this.id = this.config.id || `mc-sidepanel-${uniqueId++}`;
        this.containerInstance.id = this.id;

        // Emit when opening animation completes
        containerInstance.animationStateChanged.pipe(
            filter(
                (event) => event.phaseName === 'done' && event.toState === McSidepanelAnimationState.Visible
            ),
            take(1)
        ).subscribe(() => {
            this.afterOpened$.next();
            this.afterOpened$.complete();
        });

        // Dispose overlay when closing animation is complete
        containerInstance.animationStateChanged.pipe(
            filter(
                (event) => event.phaseName === 'done' && event.toState === McSidepanelAnimationState.Hidden
            ),
            take(1)
        ).subscribe(() => {
            overlayRef.dispose();
            this.afterClosed$.next(this.result);
            this.afterClosed$.complete();
        });

        if (!containerInstance.sidepanelConfig.disableClose) {
            merge(
                overlayRef.backdropClick(),
                overlayRef.keydownEvents().pipe(
                    // tslint:disable:deprecation
                    // keyCode is deprecated, but IE11 and Edge don't support code property, which we need use instead
                    filter((event) => event.keyCode === ESCAPE)
                )
            ).subscribe(() => this.close());
        }
    }

    close(result?: R): void {
        if (!this.afterClosed$.closed) {
            // Transition the backdrop in parallel to the sidepanel.
            this.containerInstance.animationStateChanged.pipe(
                filter((event) => event.phaseName === 'done'),
                take(1)
            ).subscribe(() => this.overlayRef.detachBackdrop());

            this.result = result;
            this.containerInstance.exit();
        }
    }

    /** Gets an observable that is notified when the sidepanel is finished closing. */
    afterClosed(): Observable<R | undefined> {
        return this.afterClosed$.asObservable();
    }

    /** Gets an observable that is notified when the sidepanel has opened and appeared. */
    afterOpened(): Observable<void> {
        return this.afterOpened$.asObservable();
    }
}
