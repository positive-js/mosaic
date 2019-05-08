import { platformBrowser } from '@angular/platform-browser';

import { DevAppModuleNgFactory } from './dev-app-module.ngfactory';


platformBrowser().bootstrapModuleFactory(DevAppModuleNgFactory);
