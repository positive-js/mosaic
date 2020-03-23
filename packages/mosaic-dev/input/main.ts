import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { InputDemoModule } from './module';


platformBrowserDynamic()
    .bootstrapModule(InputDemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));

