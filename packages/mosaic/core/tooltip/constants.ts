import { HorizontalConnectionPos, VerticalConnectionPos } from '@angular/cdk/overlay';

export type ArrowPlacements = HorizontalConnectionPos | VerticalConnectionPos;

// tslint:disable-next-line:naming-convention
export const ArrowPlacements = {
    Top: 'top' as ArrowPlacements,
    Center: 'center' as ArrowPlacements,
    Bottom: 'bottom' as ArrowPlacements,
    Right: 'right' as ArrowPlacements,
    Left: 'left' as ArrowPlacements
};

export enum TooltipVisibility {
    Initial = 'initial',
    Visible = 'visible',
    Hidden = 'hidden'
}

export enum PopoverTriggers {
    Click = 'click',
    Focus = 'focus',
    Hover = 'hover'
}

