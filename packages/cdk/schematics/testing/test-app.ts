import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';


/** Create a base app used for testing. */
export async function createTestApp(runner: SchematicTestRunner, appOptions = {}, tree?: Tree):
    Promise<UnitTestTree> {
    const workspaceTree = runner.runExternalSchematic('@schematics/angular', 'workspace', {
        name: 'workspace',
        version: '8.0.0',
        newProjectRoot: 'projects'
    }, tree);

    return runner.runExternalSchematicAsync('@schematics/angular', 'application',
        {name: 'mosaic', ...appOptions}, workspaceTree).toPromise();
}

