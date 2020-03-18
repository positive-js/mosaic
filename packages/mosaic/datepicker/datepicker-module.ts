import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McCalendar, McCalendarHeader } from './calendar';
import { McCalendarBody } from './calendar-body';
import {
    McDatepicker,
    McDatepickerContent,
    MC_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './datepicker';
import { McDatepickerInput } from './datepicker-input';
import { McDatepickerIntl } from './datepicker-intl';
import { McDatepickerToggle, McDatepickerToggleIcon } from './datepicker-toggle';
import { McMonthView } from './month-view';
import { McMultiYearView } from './multi-year-view';
import { McYearView } from './year-view';


@NgModule({
    imports: [
        CommonModule,
        McButtonModule,
        OverlayModule,
        A11yModule,
        PortalModule,
        McIconModule
    ],
    exports: [
        McCalendar,
        McCalendarBody,
        McDatepicker,
        McDatepickerContent,
        McDatepickerInput,
        McDatepickerToggle,
        McDatepickerToggleIcon,
        McMonthView,
        McYearView,
        McMultiYearView,
        McCalendarHeader,
        McButtonModule
    ],
    declarations: [
        McCalendar,
        McCalendarBody,
        McDatepicker,
        McDatepickerContent,
        McDatepickerInput,
        McDatepickerToggle,
        McDatepickerToggleIcon,
        McMonthView,
        McYearView,
        McMultiYearView,
        McCalendarHeader
    ],
    providers: [
        McDatepickerIntl,
        MC_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER
    ],
    entryComponents: [
        McDatepickerContent,
        McCalendarHeader
    ]
})
export class McDatepickerModule {
}
