// import { Tree } from '@angular-devkit/schematics';
// import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
// import { createTestApp } from '@ptsecurity/cdk/schematics';
// import { removePackageJsonDependency } from '@schematics/angular/utility/dependencies';
// import { getFileContent } from '@schematics/angular/utility/test';
//
//
// xdescribe('ng-add schematic', () => {
//
//     let runner: SchematicTestRunner;
//     let appTree: Tree;
//
//     beforeEach(async () => {
//         runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
//         appTree = await createTestApp(runner);
//     });
//
//     it('should update package.json', async () => {
//
//         removePackageJsonDependency(appTree, '@angular/animations');
//
//         const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
//         const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
//         const dependencies = packageJson.dependencies;
//         const angularCoreVersion = dependencies['@angular/core'];
//
//         expect(dependencies['@angular/cdk']).toBeDefined();
//         expect(dependencies['@ptsecurity/mosaic']).toBeDefined();
//         expect(dependencies['@angular/forms'])
//             .toBe(
//                 angularCoreVersion,
//                 'Expected the @angular/forms package to have the same version as @angular/core.');
//         expect(dependencies['@angular/animations'])
//             .toBe(
//                 angularCoreVersion,
//                 'Expected the @angular/animations package to have the same version as @angular/core.');
//
//         expect(Object.keys(dependencies))
//             .toEqual(
//                 Object.keys(dependencies).sort(),
//                 'Expected the modified "dependencies" to be sorted alphabetically.');
//
//         expect(runner.tasks.some((task) => task.name === 'run-schematic')).toBe(true);
//     });
// });
