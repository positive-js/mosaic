import { A11yModule } from '@angular/cdk/a11y';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';

import { McIconModule } from '../../mosaic/icon/';
import { FormsModule } from '@angular/forms';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McSelectModule } from '@ptsecurity/mosaic/select';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    popoverActiveStage: number;

    isPopoverVisibleLeft: boolean = false;

    ELEMENTS = {
        BUTTON: 'button',
        INPUT: 'input',
        ICON: 'icon'
    };

    TRIGGERS = {
        CLICK: 'click',
        FOCUS: 'focus',
        HOVER: 'hover'
    };

    SIZE = {
        LARGE: 'large',
        NORMAL: 'normal',
        SMALL: 'small'
    };

    selectedElement: string = 'button';
    selectedPlacement: string = 'top';
    selectedTrigger: string = 'click';
    selectedSize: string = 'normal';
    layoutClass: string = 'flex layout-row layout-align-start-center';
    content: string = 'button text';

    constructor() {
        this.popoverActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.popoverActiveStage + direction;

        // tslint:disable-next-line:no-magic-numbers
        if (newStage < 1 || newStage > 3) { return; }

        this.popoverActiveStage += direction;
    }

    changePopoverVisibilityLeft() {
        this.isPopoverVisibleLeft = !this.isPopoverVisibleLeft;
    }

    onPopoverVisibleChangeLeft(update: boolean) {
        this.isPopoverVisibleLeft = update;
    }

    onPopoverVisibleChange() {
        console.log('onPopoverVisibleChange'); // tslint:disable-line:no-console
    }

    setPlacement(placement: string) {
        console.log(placement);
        this.selectedPlacement = placement;
    }


    showElement(): string {
        return this.selectedElement;
    }

    activated(value: string): boolean {
        console.log(value, this.selectedPlacement);
        return this.selectedPlacement === value;
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        A11yModule,
        FormsModule,
        McFormFieldModule,
        McSelectModule,
        McPopoverModule,
        McButtonModule,
        McIconModule,
        McInputModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
