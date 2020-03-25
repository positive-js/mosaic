import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ButtonDemoModule } from './module';


platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    // tslint:disable-next-line:no-console
    .catch((error) => console.error(error));

