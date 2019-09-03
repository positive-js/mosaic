import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McTabsModule } from '@ptsecurity/mosaic/tabs';

import { DocViewerModule } from '../../shared/doc-viewer/doc-viewer-module';
import { DocumentationItems } from '../../shared/documentation-items/documentation-items';
import { TableOfContentsModule } from '../../shared/table-of-contents/table-of-contents.module';
import { AnchorsModule } from '../anchors/anchors.module';

import {
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './component-viewer.component';


@NgModule({
    imports: [
        AnchorsModule,
        McTabsModule,
        RouterModule,
        DocViewerModule,
        CommonModule,
        TableOfContentsModule
    ],
    exports: [
        ComponentViewerComponent
    ],
    declarations: [
        ComponentViewerComponent,
        ComponentOverviewComponent
    ],
    providers: [DocumentationItems]
})
export class ComponentViewerModule {}
