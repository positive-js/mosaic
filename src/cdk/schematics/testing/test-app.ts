import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';


/** Create a base app used for testing. */
export function createTestApp(runner: SchematicTestRunner, appOptions = {}): UnitTestTree {
    const workspaceTree = runner.runExternalSchematic('@schematics/angular', 'workspace', {
        name: 'workspace',
        version: '7.0.0',
        newProjectRoot: 'projects'
    });

    return runner.runExternalSchematic('@schematics/angular', 'application',
        {...appOptions, name: 'material'}, workspaceTree);
}
