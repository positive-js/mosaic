import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ENTER } from '@ptsecurity/cdk/keycodes';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { MC_TAGS_DEFAULT_OPTIONS, McTagsDefaultOptions } from './tag-default-options';
import { McTagInput } from './tag-input';
import { McTagList } from './tag-list.component';
import { McTag, McTagAvatar, McTagRemove, McTagTrailingIcon } from './tag.component';


@NgModule({
    imports: [CommonModule, PlatformModule],
    exports: [
        McTagList,
        McTag,
        McTagInput,
        McTagTrailingIcon,
        McTagAvatar,
        McTagRemove
    ],
    declarations: [
        McTagList,
        McTag,
        McTagInput,
        McTagTrailingIcon,
        McTagAvatar,
        McTagRemove
    ],
    providers: [{
        provide: MC_TAGS_DEFAULT_OPTIONS,
        // tslint:disable-next-line: no-object-literal-type-assertion
        useValue: { separatorKeyCodes: [ENTER] } as McTagsDefaultOptions
    }]
})
export class McTagsModule {}
