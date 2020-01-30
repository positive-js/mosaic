import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';

import { createTestApp } from '../testing';


describe('CDK ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
    appTree = createTestApp(runner);
  });

  it('should update the package.json', async () => {
    const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.dependencies;

    expect(dependencies['@ptsecurity/cdk']).toBeDefined();
    expect(Object.keys(dependencies)).toEqual(Object.keys(dependencies).sort(),
        'Expected the modified "dependencies" to be sorted alphabetically.');
  });
});
