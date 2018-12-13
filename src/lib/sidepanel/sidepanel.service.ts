import {
    ComponentRef,
    Inject,
    Injectable,
    InjectionToken,
    Injector, OnDestroy,
    Optional,
    SkipSelf,
    TemplateRef
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@ptsecurity/cdk/overlay';
import { ComponentPortal, IComponentType, PortalInjector, TemplatePortal } from '@ptsecurity/cdk/portal';
import {
    MC_SIDEPANEL_DATA,
    McSidepanelConfig,
    McSidepanelContainerComponent,
    McSidepanelRef
} from '@ptsecurity/mosaic/sidepanel';


/** Injection token that can be used to specify default dialog options. */
export const MC_SIDEPANEL_DEFAULT_OPTIONS =
    new InjectionToken<McSidepanelConfig>('mc-sidepanel-default-options');

@Injectable()
export class McSidepanelService implements OnDestroy {
    private openedSidepanelsAtThisLevel: McSidepanelRef[] = [];

    /** Keeps track of the currently-open dialogs. */
    get openedSidepanels(): McSidepanelRef[] {
        return this.parentSidepanelService ? this.parentSidepanelService.openedSidepanels :
            this.openedSidepanelsAtThisLevel;
    }

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Optional() @Inject(MC_SIDEPANEL_DEFAULT_OPTIONS) private defaultOptions: McSidepanelConfig,
        @Optional() @SkipSelf() private parentSidepanelService: McSidepanelService) {
    }

    ngOnDestroy() {
        // Only close the sidepanels at this level on destroy
        // since the parent service may still be active.
        this.closeSidepanels(this.openedSidepanelsAtThisLevel);
    }

    open<T, D = any>(componentOrTemplateRef: IComponentType<T> | TemplateRef<T>,
                     config?: McSidepanelConfig<D>): McSidepanelRef<T> {
        const fullConfig = {
            ...(this.defaultOptions || new McSidepanelConfig()),
            ...config
        };

        if (fullConfig.id && this.getSidepanelById(fullConfig.id)) {
            throw Error(`Sidepanel with id "${fullConfig.id}" exists already. The sidepanel id must be unique.`);
        }

        const overlayRef = this.createOverlay(fullConfig);
        const container = this.attachContainer(overlayRef, fullConfig);
        const ref = new McSidepanelRef(container, overlayRef, fullConfig.id);

        if (componentOrTemplateRef instanceof TemplateRef) {
            container.attachTemplatePortal(new TemplatePortal<T>(componentOrTemplateRef, null!, {
                $implicit: fullConfig.data,
                sidepanelRef: ref
            } as any));
        } else {
            const injector = this.createInjector(fullConfig, ref, container);
            const portal = new ComponentPortal(componentOrTemplateRef, undefined, injector);
            const contentRef = container.attachComponentPortal(portal);

            ref.instance = contentRef.instance;
        }

        this.openedSidepanels.push(ref);
        ref.afterClosed().subscribe(() => this.removeOpenSidepanel(ref));
        container.enter();

        return ref;
    }

    /**
     * Closes all of the currently-open sidepanels.
     */
    closeAll(): void {
        this.closeSidepanels(this.openedSidepanels);
    }

    /**
     * Finds an open sidepanel by its id.
     * @param id ID to use when looking up the sidepanel.
     */
    getSidepanelById(id: string): McSidepanelRef | undefined {
        return this.openedSidepanels.find((sidepanel) => sidepanel.id === id);
    }

    /**
     * Attaches the sidepanel container component to the overlay.
     */
    private attachContainer(overlayRef: OverlayRef, config: McSidepanelConfig): McSidepanelContainerComponent {
        const injector = new PortalInjector(this.injector, new WeakMap([
            [McSidepanelConfig, config]
        ]));

        const containerPortal = new ComponentPortal(McSidepanelContainerComponent, undefined, injector);
        const containerRef: ComponentRef<McSidepanelContainerComponent> = overlayRef.attach(containerPortal);

        return containerRef.instance;
    }

    /**
     * Creates a custom injector to be used inside the sidepanel. This allows a component loaded inside
     * of a sidepanel to close itself and, optionally, to return a value.
     * @param config Config object that is used to construct the sidepanel.
     * @param sidepanelRef Reference to the dialog.
     * @param sidepanelContainer Dialog container element that wraps all of the contents.
     * @returns The custom injector that can be used inside the dialog.
     */
    private createInjector<T>(
        config: McSidepanelConfig,
        sidepanelRef: McSidepanelRef<T>,
        sidepanelContainer: McSidepanelContainerComponent): PortalInjector {

        // The McSidepanelContainerComponent is injected in the portal as the McSidepanelContainerComponent and
        // the dialog's content are created out of the same ViewContainerRef and as such, are siblings for injector
        // purposes. To allow the hierarchy that is expected, the MatDialogContainer is explicitly
        // added to the injection tokens.
        const injectionTokens = new WeakMap<any>([
            [McSidepanelContainerComponent, sidepanelContainer],
            [MC_SIDEPANEL_DATA, config.data],
            [McSidepanelRef, sidepanelRef]
        ]);

        return new PortalInjector(this.injector, injectionTokens);
    }

    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified sidepanel config.
     */
    private createOverlay(config: McSidepanelConfig): OverlayRef {
        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            maxWidth: '100%',
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay.position().global()
        });

        return this.overlay.create(overlayConfig);
    }

    private closeSidepanels(sidepanels: McSidepanelRef[]) {
        const reversedOpenedSidepanels = [...sidepanels.reverse()];

        reversedOpenedSidepanels.forEach((sidepanelRef: McSidepanelRef) => {
            sidepanelRef.close();
        });
    }

    /**
     * Removes a sidepanel from the array of open sidepanels.
     * @param sidepanelRef Sidepanel to be removed.
     */
    private removeOpenSidepanel(sidepanelRef: McSidepanelRef) {
        const index = this.openedSidepanels.indexOf(sidepanelRef);

        if (index > -1) {
            this.openedSidepanels.splice(index, 1);
        }
    }
}
