// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationTypeEnum, Site, SitesMenuModule } from '@ptsecurity/mosaic-common-components/sites-menu';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';


const data: Site = {
    id: '00f3c418-93a6-4b58-a605-f7141aff4fa2',
    name: 'Площадка',
    alias: 'SITE',
    address: 'mp-fb9.rd.ptsecurity.ru',
    isCurrent: true,
    children: [
        {
            id: '76c74a26-9db1-4a72-8374-30ec806374c2',
            name: 'mp-fb14',
            alias: 'mp-fb14',
            address: 'mp-fb14.rd.ptsecurity.ru',
            isCurrent: false,
            children: [],
            applications: [
                {
                    id: '14157a7a-5ac0-0001-0000-000000000002',
                    alias: 'App-1',
                    displayName: 'Management and Configuration',
                    endpoint: 'https://mp-fb14.rd.ptsecurity.ru:3334',
                    type: ApplicationTypeEnum.MC
                },
                {
                    id: '14157bc9-7000-0001-0000-000000000004',
                    alias: 'KB-1',
                    displayName: 'Knowledge Base',
                    endpoint: 'https://mp-fb14.rd.ptsecurity.ru:8091',
                    type: ApplicationTypeEnum.PTKB
                },
                {
                    id: '14157b6f-9a00-0001-0000-000000000003',
                    alias: 'MP-1',
                    displayName: 'MaxPatrol 10',
                    endpoint: 'https://mp-fb14.rd.ptsecurity.ru',
                    type: ApplicationTypeEnum.MPSIEM
                }
            ]
        },
        {
            id: '74c4c617-c15b-41bd-845a-e299f9b5fb6b',
            name: 'mp-fb21',
            alias: 'mp-fb21',
            address: 'mp-fb21.rd.ptsecurity.ru',
            isCurrent: false,
            children: [],
            applications: [
                {
                    id: '1416902e-adc0-0001-0000-000000000002',
                    alias: 'App-3',
                    displayName: 'Management and Configuration',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru:3334',
                    type: ApplicationTypeEnum.MC
                },
                {
                    id: '141691c9-c200-0001-0000-000000000004',
                    alias: 'KB-3',
                    displayName: 'Knowledge Base',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru:8091',
                    type: ApplicationTypeEnum.PTKB
                },
                {
                    id: '1416914e-8a00-0001-0000-000000000003',
                    alias: 'MP-3',
                    displayName: 'MaxPatrol 10',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru',
                    type: ApplicationTypeEnum.MPSIEM
                }
            ]
        },
        {
            id: '73c4c617-c15b-41bd-845a-e299f9b5fb6a',
            name: 'mp-fb19',
            alias: 'mp-fb19',
            address: 'mp-fb19.rd.ptsecurity.ru',
            isCurrent: false,
            children: [],
            applications: [
                {
                    id: '1416902e-adc0-0001-0000-000000000002',
                    alias: 'App-4',
                    displayName: 'Management and Configuration',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru:3334',
                    type: ApplicationTypeEnum.MC
                },
                {
                    id: '141691c9-c200-0001-0000-000000000004',
                    alias: 'KB-4',
                    displayName: 'Knowledge Base',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru:8091',
                    type: ApplicationTypeEnum.PTKB
                },
                {
                    id: '1416914e-8a00-0001-0000-000000000003',
                    alias: 'MP-4',
                    displayName: 'MaxPatrol 10',
                    endpoint: 'https://mp-fb19.rd.ptsecurity.ru',
                    type: ApplicationTypeEnum.MPSIEM
                }
            ]
        }
    ],
    applications: [
        {
            id: '1415ad7e-8400-0001-0000-000000000002',
            alias: 'App-2',
            displayName: 'Management and Configuration',
            endpoint: 'http://localhost:4200/',
            type: ApplicationTypeEnum.MC
        },
        {
            id: '1415af1c-a600-0001-0000-000000000004',
            alias: 'KB-2',
            displayName: 'Knowledge Base',
            endpoint: 'https://mp-fb9.rd.ptsecurity.ru:8091',
            type: ApplicationTypeEnum.PTKB
        },
        {
            id: '1415ae9c-dbc0-0001-0000-000000000003',
            alias: 'MP-2',
            displayName: 'MaxPatrol 10',
            endpoint: 'https://mp-fb9.rd.ptsecurity.ru',
            type: ApplicationTypeEnum.MPSIEM
        }
    ]
};

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SitesMenuDemoComponent {
    apiMenu = data;

}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,

        McNavbarModule,
        McIconModule,
        McDropdownModule,
        SitesMenuModule
    ],
    declarations: [
        SitesMenuDemoComponent
    ],
    entryComponents: [ SitesMenuDemoComponent ],
    bootstrap: [ SitesMenuDemoComponent ]
})
export class DemoModule {}
