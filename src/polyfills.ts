
import 'core-js/es6';
import 'core-js/es7/reflect';

import 'zone.js/dist/zone';

if ('production' === ENV) {

    /* tslint:disable:no-var-requires */
    require('zone.js/dist/zone');

} else {
    Error.stackTraceLimit = Infinity;

    /* tslint:disable:no-var-requires */
    require('zone.js/dist/long-stack-trace-zone');
}
