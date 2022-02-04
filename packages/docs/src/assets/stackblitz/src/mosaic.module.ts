import { NgModule } from '@angular/core';
import { McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McButtonToggleModule } from '@ptsecurity/mosaic/button-toggle';
import { McCardModule } from '@ptsecurity/mosaic/card';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McHighlightModule, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McDividerModule } from '@ptsecurity/mosaic/divider';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McLinkModule } from '@ptsecurity/mosaic/link';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McModalModule } from '@ptsecurity/mosaic/modal';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';
import { McProgressBarModule } from '@ptsecurity/mosaic/progress-bar';
import { McProgressSpinnerModule } from '@ptsecurity/mosaic/progress-spinner';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McSidebarModule } from '@ptsecurity/mosaic/sidebar';
import { McSidepanelModule } from '@ptsecurity/mosaic/sidepanel';
import { McSplitterModule } from '@ptsecurity/mosaic/splitter';
import { McTableModule } from '@ptsecurity/mosaic/table';
import { McTabsModule } from '@ptsecurity/mosaic/tabs';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';


const MC_COMPONENTS = [
    McAutocompleteModule,
    McButtonModule,
    McButtonToggleModule,
    McCardModule,
    McCheckboxModule,
    McDatepickerModule,
    McDividerModule,
    McDropdownModule,
    McFormFieldModule,
    McIconModule,
    McInputModule,
    McLinkModule,
    McListModule,
    McModalModule,
    McLuxonDateModule,
    McNavbarModule,
    McPopoverModule,
    McProgressBarModule,
    McProgressSpinnerModule,
    McRadioModule,
    McSelectModule,
    McSidebarModule,
    McSidepanelModule,
    McSplitterModule,
    McTableModule,
    McTabsModule,
    McTagsModule,
    McTextareaModule,
    McTimepickerModule,
    McToggleModule,
    McToolTipModule,
    McTreeModule,
    McTreeSelectModule
];

const MC_CORE = [
    McHighlightModule,
    McPseudoCheckboxModule
];


@NgModule({
    exports: [
        ...MC_COMPONENTS,
        ...MC_CORE
    ]
})
export class DemoMosaicModule {}
