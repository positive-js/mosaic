import { existsSync, lstatSync, readdirSync } from 'fs';
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

    const entryPoints = getSubdirectoryNames(packageDir)
        .filter((d) => existsSync(join(packageDir, d, 'tsconfig.build.json')));

    const buildNodes: IBuildNode[] = entryPoints
        .map((p) => ({name: p, deps: [], depth: 0}));


    return partitionNodesByDepth(buildNodes)
        .map((level) => level.map((node) => node.name));
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
