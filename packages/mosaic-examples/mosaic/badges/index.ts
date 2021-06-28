import { NgModule } from '@angular/core';

import { BadgesOverviewExample } from './badges-overview/badges-overview-example';


export {
    BadgesOverviewExample
};

const EXAMPLES = [
    BadgesOverviewExample
];

@NgModule({
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class BadgesExamplesModule {
}
