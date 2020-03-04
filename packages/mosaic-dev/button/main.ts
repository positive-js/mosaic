import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ButtonDemoModule } from './module';


platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    .catch((error) => console.error(error));

