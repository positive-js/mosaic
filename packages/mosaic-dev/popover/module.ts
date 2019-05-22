import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';
import { McIconModule } from '../../mosaic/icon/';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    encapsulation: ViewEncapsulation.None,
    template: require('./template.html')
})
export class DemoComponent {
    private popoverActiveStage: number;

    private isPopoverVisibleLeft: boolean = false;
    private isPopoverVisibleLeftTop: boolean = false;
    private isPopoverVisibleLeftBottom: boolean = false;
    private isPopoverVisibleBottom: boolean = false;
    private isPopoverVisibleBottomRight: boolean = false;
    private isPopoverVisibleBottomLeft: boolean = false;
    private isPopoverVisibleRight: boolean = false;
    private isPopoverVisibleRightTop: boolean = false;
    private isPopoverVisibleRightBottom: boolean = false;
    private isPopoverVisibleTop: boolean = false;
    private isPopoverVisibleTopRight: boolean = false;
    private isPopoverVisibleTopLeft: boolean = false;

    constructor() {
        this.popoverActiveStage = 1;
    }

    changeStep(direction: number) {
        this.popoverActiveStage += direction;
    }

    changePopoverVisibilityLeft() {
        this.isPopoverVisibleLeft = !this.isPopoverVisibleLeft;
    }

    changePopoverVisibilityLeftTop() {
        this.isPopoverVisibleLeftTop = !this.isPopoverVisibleLeftTop;
    }

    changePopoverVisibilityLeftBottom() {
        this.isPopoverVisibleLeftBottom = !this.isPopoverVisibleLeftBottom;
    }

    changePopoverVisibilityBottom() {
        this.isPopoverVisibleBottom = !this.isPopoverVisibleBottom;
    }

    changePopoverVisibilityBottomRight() {
        this.isPopoverVisibleBottomRight = !this.isPopoverVisibleBottomRight;
    }

    changePopoverVisibilityBottomLeft() {
        this.isPopoverVisibleBottomLeft = !this.isPopoverVisibleBottomLeft;
    }

    changePopoverVisibilityRight() {
        this.isPopoverVisibleRight = !this.isPopoverVisibleRight;
    }

    changePopoverVisibilityRightTop() {
        this.isPopoverVisibleRightTop = !this.isPopoverVisibleRightTop;
    }

    changePopoverVisibilityRightBottom() {
        this.isPopoverVisibleRightBottom = !this.isPopoverVisibleRightBottom;
    }

    changePopoverVisibilityTop() {
        this.isPopoverVisibleTop = !this.isPopoverVisibleTop;
    }

    changePopoverVisibilityTopRight() {
        this.isPopoverVisibleTopRight = !this.isPopoverVisibleTopRight;
    }

    changePopoverVisibilityTopLeft() {
        this.isPopoverVisibleTopLeft = !this.isPopoverVisibleTopLeft;
    }

    onPopoverVisibleChangeLeft(update: boolean) {
        this.isPopoverVisibleLeft = update;
    }

    onPopoverVisibleChangeLeftTop(update: boolean) {
        this.isPopoverVisibleLeftTop = update;
    }

    onPopoverVisibleChangeLeftBottom(update: boolean) {
        this.isPopoverVisibleLeftBottom = update;
    }

    onPopoverVisibleChangeBottom(update: boolean) {
        this.isPopoverVisibleBottom = update;
    }

    onPopoverVisibleChangeBottomRight(update: boolean) {
        this.isPopoverVisibleBottomRight = update;
    }

    onPopoverVisibleChangeBottomLeft(update: boolean) {
        this.isPopoverVisibleBottomLeft = update;
    }

    onPopoverVisibleChangeRight(update: boolean) {
        this.isPopoverVisibleRight = update;
    }

    onPopoverVisibleChangeRightTop(update: boolean) {
        this.isPopoverVisibleRightTop = update;
    }

    onPopoverVisibleChangeRightBottom(update: boolean) {
        this.isPopoverVisibleRightBottom = update;
    }

    onPopoverVisibleChangeTop(update: boolean) {
        this.isPopoverVisibleTop = update;
    }

    onPopoverVisibleChangeTopRight(update: boolean) {
        this.isPopoverVisibleTopRight = update;
    }

    onPopoverVisibleChangeTopLeft(update: boolean) {
        this.isPopoverVisibleTopLeft = update;
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McPopoverModule,
        McButtonModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {
}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error)); // tslint:disable-line
