import { Tree } from '@angular-devkit/schematics';


function sortObjectByKeys(obj: object) {
    return Object.keys(obj).sort().reduce((result, key) => (result[key] = obj[key]) && result, {});
}

export function getPackageVersionFromPackageJson(tree: Tree, name: string): string | null {
    if (!tree.exists('package.json')) {
        return null;
    }

    const packageJson = JSON.parse(tree.read('package.json')!.toString('utf8'));

    if (packageJson.dependencies && packageJson.dependencies[name]) {
        return packageJson.dependencies[name];
    }

    return null;
}

export function addPackageToPackageJson(host: Tree, pkg: string, version: string): Tree {

    if (host.exists('package.json')) {

        const sourceText = host.read('package.json')!.toString('utf-8');
        const json = JSON.parse(sourceText);

        if (!json.dependencies) {
            json.dependencies = {};
        }

        if (!json.dependencies[pkg]) {
            json.dependencies[pkg] = version;
            json.dependencies = sortObjectByKeys(json.dependencies);
        }

        host.overwrite('package.json', JSON.stringify(json, null, 4));
    }

    return host;
}
