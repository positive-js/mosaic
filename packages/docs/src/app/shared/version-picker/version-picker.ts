import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { mosaicVersion, VersionInfo } from '../version/version';


const versionUrl = '';

@Component({
    selector: 'version-picker',
    templateUrl: './version-picker.html'
})
export class VersionPicker {
    /** The currently running versin of Material. */
    mosaicVersion = mosaicVersion;
    /** The possible versions of the doc site. */
    docVersions = this.http.get(versionUrl);

    constructor(private http: HttpClient) {
    }

    /** Updates the window location if the selected version is a different version. */
    onVersionChanged(version: VersionInfo) {
        if (!version.url.startsWith(window.location.href)) {
            window.location.assign(version.url);
        }
    }
}

@NgModule({
    imports: [McButtonModule, CommonModule],
    exports: [VersionPicker],
    declarations: [VersionPicker]
})
export class VersionPickerModule {
}
