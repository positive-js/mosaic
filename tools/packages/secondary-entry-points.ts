import { spawnSync } from 'child_process';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { platform } from 'os';
import { join } from 'path';

import { BuildPackage } from './build-package';


/**
 * Gets secondary entry-points for a given package in the order they should be built.
 *
 * This currently assumes that every directory under a package should be an entry-point except for
 * specifically black-listed directories.
 */
export function getSecondaryEntryPointsForPackage(pkg: BuildPackage) {

    const packageName = pkg.name;
    const packageDir = pkg.sourceDir;

    // Get the list of all entry-points as the list of directories in the package that have a
    // tsconfig.build.json
    const entryPoints = getSubdirectoryNames(packageDir)
        .filter((d) => existsSync(join(packageDir, d, 'tsconfig.build.json')));

    // Create nodes that comprise the build graph.
    const buildNodes: IBuildNode[] = entryPoints
        .map((p) => ({name: p, deps: [], depth: 0}));

    // Create a lookup for name -> build graph node.
    const nodeLookup = buildNodes.reduce((lookup, node) => {
        return lookup.set(node.name, node);
    }, new Map<string, IBuildNode>());

    const importRegex = new RegExp(`${packageName}/(.+)';`);

    // Update the deps for each node to point to the appropriate BuildNodes.
    buildNodes.forEach((node) => {
        const importStatementFindCommand = buildPackageImportStatementFindCommand(
            join(packageDir, node.name), packageName);

        /* tslint:disable:no-trailing-whitespace */
        node.deps = spawnSync(importStatementFindCommand.binary, importStatementFindCommand.args)
            .stdout
            .toString()
            .split('\n')
            .filter((n) => n)
            .map((importStatement) => importStatement.match(importRegex)![1])
            .filter((n) => nodeLookup.has(n) && n !== node.name)
            .map((depName) => nodeLookup.get(depName)!) || [];
        /* tslint:enable:no-trailing-whitespace */
    });

    // Concatenate the build order for each node into one global build order.
    // Duplicates are automatically omitted by getBuildOrder.
    const buildOrder = buildNodes.reduce((order: IBuildNode[], node) => {
        return [...order, ...getBuildOrder(node)];
    }, []);

    return partitionNodesByDepth(buildOrder).map((level) => level.map((node) => node.name));
}

/** Gets the build order for node with DFS. As a side-effect, sets the depth on visited nodes. */
function getBuildOrder(node: IBuildNode): IBuildNode[] {
    if (node.visited) {
        return [];
    }

    let buildOrder: IBuildNode[] = [];

    for (const dep of node.deps) {
        buildOrder = [...buildOrder, ...getBuildOrder(dep)];
        node.depth = node.deps.reduce((maxDepth, d) => Math.max(d.depth + 1, maxDepth), -1);
    }

    node.visited = true;

    return [...buildOrder, node];
}

export function getSubdirectoryNames(dir: string): string[] {

    return readdirSync(dir).filter((f) => lstatSync(join(dir, f)).isDirectory());
}

/**
 * A node in the build graph of a package's entry-points.
 */
interface IBuildNode {
    name: string;
    deps: IBuildNode[];
    visited?: boolean;
    depth: number;
}

/**
 * `Partitions nodes into groups by depth. For example,
 * [{name: a11y, depth: 1}, {name: bidi, depth: 0}, {name: platform, depth: 0}]
 * =>
 * [ [{name: bidi, depth: 0}, {name: platform, depth: 0}], [{name: a11y, depth: 1}] ]`
 */
function partitionNodesByDepth(nodes: IBuildNode[]): IBuildNode[][] {
    const result: IBuildNode[][] = [[]];
    let lastDepth = 0;

    nodes.sort((a, b) => a.depth - b.depth).forEach((node) => {
        if (node.depth === lastDepth) {
            result[result.length - 1].push(node);
        } else {
            result.push([node]);
            lastDepth = node.depth;
        }
    });

    return result;
}

/**
 * Builds the command that will be executed to find all import statements for a package.
 */
function buildPackageImportStatementFindCommand(searchDirectory: string, packageName: string) {
    if (platform() === 'win32') {
        return {
            binary: 'findstr',
            args: ['/spin', `from.'@ptsecurity/${packageName}/.*'`, `${searchDirectory}\\*.ts`]
        };
    } else {
        return {
            binary: 'grep',
            args: ['-Eroh', '--include', '*.ts', `from '@ptsecurity/${packageName}/.+';`, searchDirectory]
        };
    }
}
