import { InjectionToken } from '@angular/core';

/** Object that can be used to configure the default options for the tabs module. */
export interface IMcTabsConfig {
    /** Duration for the tab animation. Must be a valid CSS value (e.g. 500ms). */
    animationDuration?: string;

    /**
     * Whether pagination should be disabled. This can be used to avoid unnecessary
     * layout recalculations if it's known that pagination won't be required.
     */
    disablePagination?: boolean;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const MC_TABS_CONFIG = new InjectionToken<IMcTabsConfig>('MC_TABS_CONFIG');
