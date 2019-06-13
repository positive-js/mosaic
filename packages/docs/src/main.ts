import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/';
import { environment } from './environments/environment';
// tslint:disable-next-line:no-import-side-effect
import './polyfills.ts';


// tslint:disable-next-line:blank-lines
if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
