export { McCommonModule, MC_SANITY_CHECKS } from './common-module';

export { CanDisable, CanDisableCtor, mixinDisabled } from './disabled';
export { CanColor, CanColorCtor, mixinColor, ThemePalette } from './color';
export { HasTabIndex, HasTabIndexCtor, mixinTabIndex } from './tabindex';
export { CanUpdateErrorStateCtor, CanUpdateErrorState, mixinErrorState } from './error-state';

export enum MultipleMode {
    CHECKBOX = 'checkbox',
    KEYBOARD = 'keyboard'
}

