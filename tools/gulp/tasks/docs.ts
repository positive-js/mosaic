import { task } from 'gulp';
import { Dgeni } from 'dgeni';

import { apiDocsPackage } from '../../dgeni';


task('api-docs', () => {
    const docs = new Dgeni([apiDocsPackage]);
    return docs.generate();
});
