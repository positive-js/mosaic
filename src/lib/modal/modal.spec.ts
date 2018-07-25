import { Component } from '@angular/core';
import { async, fakeAsync, flush, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McButton, McButtonModule } from '@ptsecurity/mosaic/button';

import { McMeasureScrollbarService } from '../core/services/measure-scrollbar.service';

import { McModalComponent } from './modal.component';
import { McModalModule } from './modal.module';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console

describe('modal testing (legacy)', () => {
    let instance;
    let fixture: ComponentFixture<{}>;

    describe('demo-async', () => {
        let modalElement: HTMLElement;
        let buttonShow: HTMLButtonElement;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ McModalModule, McButtonModule ],
                declarations: [ McDemoModalAsyncComponent ],
                providers   : [ McMeasureScrollbarService ]
            }).compileComponents()
                .then(result => console.log('Result:', result))
                .catch( (error) => console.error('Error: ', error));
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(McDemoModalAsyncComponent);
            instance = fixture.debugElement.componentInstance;
            modalElement = fixture.debugElement.query(By.directive(McModalComponent)).nativeElement;
            buttonShow = fixture.debugElement.query(By.directive(McButton)).nativeElement;
        });

        it('should show and hide after 3000ms with loading', fakeAsync(() => {
            buttonShow.click();
            fixture.detectChanges();
            flush();
            expectModalHidden(modalElement, false);
        }));
    }); // /async

});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    selector: 'mc-demo-modal-async',
    template: `
        <button mc-button color="primary" (click)="showModal()">
            <span>show modal</span>
        </button>
        <mc-modal [(mcVisible)]="isVisible" mcTitle="title" (mcOnCancel)="handleCancel()" (mcOnOk)="handleOk()"
                  [mcOkLoading]="isOkLoading">
            <p>content</p>
        </mc-modal>
    `,
    styles: []
})
class McDemoModalAsyncComponent {
    isVisible = false;
    isOkLoading = false;

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        this.isOkLoading = true;
        window.setTimeout(() => {
            this.isVisible = false;
            this.isOkLoading = false;
        }, 3000);
    }

    handleCancel(): void {
        this.isVisible = false;
    }
}


// -------------------------------------------
// | Local tool functions
// -------------------------------------------

function expectModalHidden(modalElement: HTMLElement, hidden: boolean): void {
    const display = (modalElement.querySelector('.mc-modal-wrap') as HTMLElement).style.display;

    if (hidden) {
        expect(display).toBe('none');
    } else {
        expect(display).not.toBe('none');
    }
    // @ts-ignore
    expect(modalElement.querySelector('.mc-modal-mask').classList.contains('mc-modal-mask-hidden')).toBe(hidden);
}

function expectModalDestroyed(classId: string, destroyed: boolean): void {
    const element = document.querySelector(`.${classId}`);

    if (destroyed) {
        expect(element).toBeFalsy();
    } else {
        expect(element).not.toBeFalsy();
    }
}

let counter = 0;

function generateUniqueId(): string {
    return `testing-uniqueid-${counter++}`;
}

function getButtonOk(modalElement: HTMLElement): HTMLButtonElement {
    return isConfirmModal(modalElement) ? modalElement.querySelector('.mc-confirm-btns button:first-child') as HTMLButtonElement : modalElement.querySelector('.mc-modal-footer button:first-child') as HTMLButtonElement;
}

function getButtonCancel(modalElement: HTMLElement): HTMLButtonElement {
    return isConfirmModal(modalElement) ? modalElement.querySelector('.mc-confirm-btns button:first-child') as HTMLButtonElement : modalElement.querySelector('.mc-modal-footer button:first-child') as HTMLButtonElement;
}

function getButtonClose(modalElement: HTMLElement): HTMLButtonElement { // For normal modal only
    return modalElement.querySelector('.mc-modal-close') as HTMLButtonElement;
}

function isConfirmModal(modalElement: HTMLElement): boolean {
    return !!modalElement.querySelector('.mc-confirm');
}

function isButtonLoading(buttonElement: HTMLButtonElement): boolean {
    return !!buttonElement.querySelector('i.anticon-loading');
}
