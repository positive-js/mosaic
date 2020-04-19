import { getSystemPath, normalize } from '@angular-devkit/core';
import { TempScopedNodeJsSyncHost } from '@angular-devkit/core/node/testing';
import * as virtualFs from '@angular-devkit/core/src/virtual-fs/host';
import { HostTree, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readFileSync, rmdirSync } from 'fs';
import { basename, extname } from 'path';


/** Create a base app used for testing. */
export async function createTestApp(
    runner: SchematicTestRunner,
    appOptions: { name?: string } = {},
    tree?: Tree
): Promise<UnitTestTree> {

    const workspaceTree = await runner
        .runExternalSchematicAsync(
            '@schematics/angular',
            'workspace',
            {
                name: 'workspace',
                version: '6.0.0',
                newProjectRoot: 'projects'
            },
            tree
        )
        .toPromise();

    return runner
        .runExternalSchematicAsync(
            '@schematics/angular',
            'application',
            { name: '@ptsecurity/mosaic', ...appOptions },
            workspaceTree
        )
        .toPromise();
}


export async function createFileSystemTestApp(runner: SchematicTestRunner): Promise<ITestCaseSetup> {
    const tempFileSystemHost = new TempScopedNodeJsSyncHost();
    const hostTree = new HostTree(tempFileSystemHost);

    const appTree: UnitTestTree = await createTestApp(
        runner,
        { name: 'lib-testing' },
        hostTree
    );

    const tempPath = getSystemPath(tempFileSystemHost.root);

    // Since the TypeScript compiler API expects all files to be present on the real file system, we
    // map every file in the app tree to a temporary location on the file system.
    appTree.files.forEach((f) => {
        writeFile(f, appTree.readContent(f));
    });

    return {
        appTree,
        tempFileSystemHost,
        tempPath,
        writeFile,
        removeTempDir: () => {
            rmdirSync(tempPath, { recursive: true });
        }
    };

    function writeFile(filePath: string, content: string): void {
        tempFileSystemHost.sync.write(
            normalize(filePath),
            virtualFs.stringToFileBuffer(content)
        );
    }
}

interface ITestCaseSetup {
    appTree: UnitTestTree;
    tempPath: string;
    tempFileSystemHost?: TempScopedNodeJsSyncHost;
    runFixers?(): Promise<{ logOutput: string }>;
    removeTempDir(): void;
    writeFile(filePath: string, content: string): void;
}

export async function createTestCaseSetup(
    migrationName: string,
    collectionPath: string,
    inputFiles: string[]
): Promise<ITestCaseSetup> {

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const initialWorkingDir = process.cwd();

    let logOutput = '';
    runner.logger.subscribe((entry) => (logOutput += `${entry.message}\n`));

    const {
        appTree,
        tempPath,
        writeFile,
        removeTempDir
    } = await createFileSystemTestApp(runner);

    patchTypeScriptDefaultLib(appTree);

    // Write each test-case input to the file-system. This is necessary because otherwise
    // TypeScript compiler API won't be able to pick up the test cases.
    inputFiles.forEach((inputFilePath) => {

        const inputTestName = basename(inputFilePath, extname(inputFilePath));
        const relativePath = `projects/lib-testing/src/tests/${inputTestName}.ts`;
        const inputContent = readFileSync(inputFilePath, 'utf8');

        writeFile(relativePath, inputContent);
    });

    const testAppTsconfigPath = 'projects/lib-testing/tsconfig.app.json';
    const testAppTsconfig = JSON.parse(appTree.readContent(testAppTsconfigPath));

    // include all TypeScript files in the project. Otherwise all test input
    // files won't be part of the program and cannot be migrated.
    testAppTsconfig.include.push('src/**/*.ts');

    // tslint:disable-next-line:no-magic-numbers
    writeFile(testAppTsconfigPath, JSON.stringify(testAppTsconfig, null, 4));

    // tslint:disable-next-line:only-arrow-functions no-function-expression
    const runFixers = async function(): Promise<{ logOutput: string }> {
        // Switch to the new temporary directory to simulate that "ng update" is ran
        // from within the project.
        process.chdir(tempPath);

        await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        // Switch back to the initial working directory.
        process.chdir(initialWorkingDir);

        return { logOutput };
    };

    return { appTree, writeFile, tempPath, removeTempDir, runFixers };
}

/**
 * Patches the specified virtual file system tree to be able to read the TypeScript
 * default library typings. These need to be readable in unit tests because otherwise
 * type checking within migration rules is not working as in real applications.
 */
function patchTypeScriptDefaultLib(tree: Tree): void {
    // tslint:disable-next-line: no-unbound-method
    const originalRead = tree.read;

    // tslint:disable-next-line: no-any
    tree.read = function(filePath: string): Buffer | any {
        // In case a file within the TypeScript package is requested, we read the file from
        // the real file system. This is necessary because within unit tests, the "typeScript"
        // package from within the Bazel "@npm" repository  is used. The virtual tree can't be
        // used because the "@npm" repository directory is not part of the virtual file system.
        if (filePath.match(/node_modules[/\\]typescript/)) {
            return readFileSync(filePath);
        } else {
            return originalRead.apply(this, arguments);
        }
    };
}
