import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/';
import { environment } from './environments/environment';
// tslint:disable-next-line:no-import-side-effect
import './polyfills.ts';
import { unregisterServiceWorkers } from './unregister-service-workers';


// Unregister all installed service workers and force reload the page if there was
// an old service worker from a previous version of the docs.
unregisterServiceWorkers()
    .then(hadServiceWorker => hadServiceWorker && location.reload(true));

// tslint:disable-next-line:blank-lines
if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
