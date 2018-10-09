import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';

import { McSplitterAreaDirective } from './splitter-area.directive';

import { IArea } from './splitter.interfaces';


@Component({
    selector: 'mc-splitter',
    preserveWhitespaces: false,
    styleUrls: ['splitter.css'],
    templateUrl: './splitter.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McSplitterComponent implements OnDestroy {
    readonly areas: IArea[] = [];

    private readonly areaPositionDivider: number = 2;

    constructor() {
        return;
    }

    ngOnDestroy(): void {
        return;
    }

    addArea(area: McSplitterAreaDirective): void {
        const index: number = this.areas.length;

        this.areas.push({
            area,
            index,
            order: index * this.areaPositionDivider
        });

        this.refresh();
    }

    removeArea(area: McSplitterAreaDirective): void {
        const foundArea: IArea = <IArea> this.areas.find((a) => a.area === area);
        this.areas.splice(foundArea.index, 1);
    }

    refresh() {
        this.areas.forEach((item, index) => {
            item.order = index * this.areaPositionDivider; // save space for gutters
            item.area.setOrder(item.order);
        });
    }
}
