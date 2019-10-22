import { NgModule } from '@angular/core';

import { BadgesOverviewExample } from './badges-overview/badges-overview-example';


const EXAMPLES = [
    BadgesOverviewExample
];

@NgModule({
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class BadgesExamplesModule {
}
