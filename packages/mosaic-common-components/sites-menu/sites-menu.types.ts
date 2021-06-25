/* tslint:disable:naming-convention */
export interface Site {
    address: string;
    alias: string;
    applications: Application[];
    children: Site[];
    id: string;
    isCurrent: boolean;
    name: string;
}

export interface Application {
    id: string;
    alias: string;
    displayName: string;
    endpoint: string;
    // tslint:disable-next-line:no-reserved-keywords
    type: ApplicationTypeEnum;
}

export enum ApplicationTypeEnum {
    AF = 'PT.AF',
    CSC = 'PT.CSC',
    Cybsi = 'PT.Cybsi',
    MC = 'PTMC',
    MPSIEM = 'PT.MPSIEM',
    NAD = 'PT.NAD',
    PTKB = 'PT.PTKB'
}
