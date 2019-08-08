export interface Schema {
    /** Name of the project. */
    project: string;

    /** Whether gesture support should be set up. */
    gestures: boolean;

    /** Whether Angular browser animations should be set up. */
    animations: boolean;

    /** Name of pre-built theme to install. */
    theme: 'default-theme' | 'dark-theme' | 'custom';
}
