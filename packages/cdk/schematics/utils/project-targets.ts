import { WorkspaceProject } from '@angular-devkit/core/src/experimental/workspace';
import { SchematicsException } from '@angular-devkit/schematics';


/** Resolves the architect options for the build target of the given project. */
export function getProjectTargetOptions(project: WorkspaceProject, buildTarget: string) {
    if (project.targets &&
        project.targets[buildTarget] &&
        project.targets[buildTarget].options) {

        return project.targets[buildTarget].options;
    }

    // over to `targets`, and the `architect` support has been removed.
    // See: https://github.com/angular/angular-cli/commit/307160806cb48c95ecb8982854f452303801ac9f
    if (project.architect &&
        project.architect[buildTarget] &&
        project.architect[buildTarget].options) {

        return project.architect[buildTarget].options;
    }

    throw new SchematicsException(
        `Cannot determine project target configuration for: ${buildTarget}.`);
}

