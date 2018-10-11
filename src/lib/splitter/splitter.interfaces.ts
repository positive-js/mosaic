import { McSplitterAreaDirective } from './splitter-area.directive';


export interface IArea {
    area: McSplitterAreaDirective;
    index: number;
    order: number;
    initialSize: number;
}

export interface IPoint {
    x: number;
    y: number;
}
