import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McTableModule } from '@ptsecurity/mosaic/table';

import { TableOverviewExample } from './table-overview/table-overview-example';
import { TableWithBordersExample } from './table-with-borders/table-with-borders-example';


const EXAMPLES = [
    TableOverviewExample,
    TableWithBordersExample
];

@NgModule({
    imports: [CommonModule, McTableModule],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TableExamplesModule {}
