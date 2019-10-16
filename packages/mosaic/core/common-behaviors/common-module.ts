import { BidiModule } from '@angular/cdk/bidi';
import { NgModule, InjectionToken, Optional, Inject, isDevMode } from '@angular/core';


// Injection token that configures whether the Mosaic sanity checks are enabled.
export const MC_SANITY_CHECKS = new InjectionToken<boolean>('mc-sanity-checks', {
    providedIn: 'root',
    factory: mcSanityChecksFactory
});

export function mcSanityChecksFactory(): boolean {
    return true;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Mosaic
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., McTabsModule).
 */
@NgModule({
    imports: [ BidiModule ],
    exports: [ BidiModule ]
})
export class McCommonModule {
    // Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype).
    private hasDoneGlobalChecks = false;

    // Reference to the global `document` object.
    private document = typeof document === 'object' && document ? document : null;

    // Reference to the global 'window' object.
    private window = typeof window === 'object' && window ? window : null;

    constructor(@Optional() @Inject(MC_SANITY_CHECKS) private _sanityChecksEnabled: boolean) {
        if (this.areChecksEnabled() && !this.hasDoneGlobalChecks) {
            this.checkDoctypeIsDefined();
            this.checkThemeIsPresent();
            this.hasDoneGlobalChecks = true;
        }
    }

    // Whether any sanity checks are enabled
    private areChecksEnabled(): boolean {
        return this._sanityChecksEnabled && isDevMode() && !this.isTestEnv();
    }

    // Whether the code is running in tests.
    private isTestEnv() {
        // tslint:disable-next-line
        return this.window && (this.window['__karma__'] || this.window['jasmine']);
    }

    private checkDoctypeIsDefined(): void {
        if (this.document && !this.document.doctype) {
            console.warn(
                'Current document does not have a doctype. This may cause ' +
                'some Mosaic components not to behave as expected.'
            );
        }
    }

    private checkThemeIsPresent(): void {
        if (this.document && typeof getComputedStyle === 'function') {
            const testElement = this.document.createElement('div');

            testElement.classList.add('mc-theme-loaded-marker');
            this.document.body.appendChild(testElement);

            const computedStyle = getComputedStyle(testElement);

            // In some situations, the computed style of the test element can be null. For example in
            // Firefox, the computed style is null if an application is running inside of a hidden iframe.
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
            if (computedStyle && computedStyle.display !== 'none') {
                console.warn(
                    'Could not find Mosaic core theme. Most Mosaic ' +
                    'components may not work as expected. For more info refer ' +
                    'to the theming guide: link there'
                );
            }

            this.document.body.removeChild(testElement);
        }
    }
}
