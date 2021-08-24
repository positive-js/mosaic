import { NgModule } from '@angular/core';
import { McDividerModule } from '@ptsecurity/mosaic/divider';

import { DividerOverviewExample } from './divider-overview/divider-overview-example';
import { DividerVerticalExample } from './divider-vertical/divider-vertical-example';


export {
    DividerOverviewExample,
    DividerVerticalExample
};

const EXAMPLES = [
    DividerOverviewExample,
    DividerVerticalExample
];

@NgModule({
    imports: [McDividerModule],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DividerExamplesModule {}
