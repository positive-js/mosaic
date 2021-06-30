import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SitesMenuOverviewExample } from './sites-menu-overview/sites-menu-overview-example';


export {
    SitesMenuOverviewExample
};

const EXAMPLES = [
    SitesMenuOverviewExample
];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SitesMenuExamplesModule {}
