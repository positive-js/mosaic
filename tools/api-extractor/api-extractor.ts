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


const params = process.argv[2];

let localBuild = true;

const buildConfig = JsonFile.load('tools/api-extractor/config.json');

if (params === 'onlyCheck') {
    localBuild = false;
} else if (params) {
    buildConfig.components = [params];
}

const configObjectFullPath: string = path.resolve('tools/api-extractor/api-extractor.json');
const packageJsonLookup: PackageJsonLookup = new PackageJsonLookup();
const packageJsonFullPath: string | undefined = packageJsonLookup.tryGetPackageJsonFilePathFor(configObjectFullPath);

let hasErrors: boolean = false;

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
        localBuild,
        showVerboseMessages: true
    });

    if (result.succeeded) {
        console.error(chalk.green(`API Extractor completed successfully: ${component}`));
    } else if (result.errorCount > 0) {
        console.error(chalk.red(`API Extractor completed with ${result.errorCount} errors`));
        hasErrors = true;
    } else if (result.apiReportChanged) {
        process.exit(1);
    }
}

process.exitCode = hasErrors ? 1 : 0;

