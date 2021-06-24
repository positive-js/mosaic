interface Site {
    address: string;
    alias: string;
    applications: Application[];
    children: Site[];
    id: string;
    isCurrent: boolean;
    name: string;
}

interface Application {
    id: string;
    alias: string;
    displayName: string;
    endpoint: string;
    type: ApplicationTypeEnum;
}

enum ApplicationTypeEnum {
    AF = 'PT.AF',
    CSC = 'PT.CSC',
    Cybsi = 'PT.Cybsi',
    MC = 'PTMC',
    MPSIEM = 'PT.MPSIEM',
    NAD = 'PT.NAD',
    PTKB = 'PT.PTKB'
}


export {
    Site,
    Application,
    ApplicationTypeEnum
};
