import { McSplitterAreaDirective } from './splitter-area.directive';


export interface IArea {
    area: McSplitterAreaDirective;
    index: number;
    order: number;
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IInitialSizes {
    leftArea: number;
    rightArea: number;
}
