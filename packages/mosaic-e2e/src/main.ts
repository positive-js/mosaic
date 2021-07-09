import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McE2EAppModule } from './app/app.module';


platformBrowserDynamic()
  .bootstrapModule(McE2EAppModule)
    // tslint:disable-next-line:no-console
  .catch((err) => console.error(err));
