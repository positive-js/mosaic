import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MC_SANITY_CHECKS } from '@ptsecurity/mosaic/core';


@NgModule({
    imports: [RouterTestingModule, HttpClientTestingModule],
    exports: [RouterTestingModule],
    providers: [
        {provide: MC_SANITY_CHECKS, useValue: false}
    ]
})
export class DocsAppTestingModule {
}
