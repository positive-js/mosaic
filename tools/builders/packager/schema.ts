export interface IPackagerAssetDef {
    glob: string;
    input: string;
    output: string;
}

export interface IPackagerOptions {
    buildTarget: string;
    releaseCDKPackageJson: string;
    releaseMosaicPackageJson: string;
    versionPlaceholder: string;
    ngVersionPlaceholder: string;
    styles: IPackagerAssetDef[];
    assets: IPackagerAssetDef[];
    additionalTargets: string[];
}
