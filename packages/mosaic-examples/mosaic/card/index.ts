import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCardModule } from '@ptsecurity/mosaic/card';

import { CardOverviewExample } from './card-overview/card-overview-example';


export {
    CardOverviewExample
};

const EXAMPLES = [
    CardOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        McCardModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class CardExamplesModule {}
