import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DemoModule } from './module';


platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));
