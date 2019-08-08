import { Tree } from '@angular-devkit/schematics';
import { getProjectFromWorkspace } from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';

import { Schema } from '../schema';


//TODO: add Roboto Fonts
export function addRobotoFonts(options: Schema): (host: Tree) => Tree {

    return (host: Tree) => {
        const workspace = getWorkspace(host);
        const project = getProjectFromWorkspace(workspace, options.project);

        return host;
    };
}
