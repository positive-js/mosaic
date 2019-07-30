import { AnchorsComponent } from "./anchors.component";
import {CommonModule} from "@angular/common";
import { NgModule } from '@angular/core';

@NgModule({
    imports: [CommonModule],
    exports: [AnchorsComponent],
    declarations: [AnchorsComponent]
})
export class AnchorsModule { }
