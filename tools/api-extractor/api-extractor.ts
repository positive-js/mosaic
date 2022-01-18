/* tslint:disable:no-console no-magic-numbers */
import {
    Extractor,
    ExtractorConfig,
    IConfigFile,
    ExtractorResult
} from '@microsoft/api-extractor';
import {
    JsonFile,
    PackageJsonLookup
} from '@rushstack/node-core-library';
import * as chalk from 'chalk';
import * as path from 'path';


const componentName = process.argv[2];

const buildConfig = JsonFile.load('tools/api-extractor/config.json');

if (componentName) {
    buildConfig.components = [componentName];
}

const configObjectFullPath: string = path.resolve('tools/api-extractor/api-extractor.json');
const packageJsonLookup: PackageJsonLookup = new PackageJsonLookup();
const packageJsonFullPath: string | undefined = packageJsonLookup.tryGetPackageJsonFilePathFor(configObjectFullPath);

for (const component of buildConfig.components) {
    const configObject: IConfigFile = ExtractorConfig.loadFile(configObjectFullPath);

    const mainEntryPointFilePath = configObject.mainEntryPointFilePath.replace('button', component);
    const reportFileName = configObject!.apiReport!.reportFileName!.replace('<unscopedPackageName>', component);

    configObject.mainEntryPointFilePath = mainEntryPointFilePath;
    configObject!.apiReport!.reportFileName = reportFileName;

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        configObject,
        configObjectFullPath,
        packageJsonFullPath
    });

    const result: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true
    });

    if (result.succeeded) {
        console.error(chalk.green(`API Extractor completed successfully: ${component}`));
        process.exitCode = 0;
    } else {
        console.error(chalk.red(
            `API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
        ));
        process.exitCode = 1;
    }
}

