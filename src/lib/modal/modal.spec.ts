import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McButton, McButtonModule } from '@ptsecurity/mosaic/button';
import { McMeasureScrollbarService } from '@ptsecurity/mosaic/core';

import { McModalComponent } from './modal.component';
import { McModalModule } from './modal.module';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console

describe('modal testing', () => {
    let instance;
    let fixture: ComponentFixture<{}>;

    describe('demo-async', () => {
        let modalElement: HTMLElement;
        let buttonShow: HTMLButtonElement;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [McButtonModule, McModalModule],
                declarations: [ McDemoModalAsyncComponent ],
                providers: [McMeasureScrollbarService]
            });

            TestBed.compileComponents()
                .then((result) => console.log('Result:', result))
                .catch((error) => console.error('Error: ', error));
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(McDemoModalAsyncComponent);
            modalElement = fixture.debugElement.query(By.directive(McModalComponent)).nativeElement;
            buttonShow = fixture.debugElement.query(By.directive(McButton)).nativeElement;
        });

        it('should not apply any additional class to a list without lines', () => {
            expect(1).toBe(1);
        });
    });
});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    selector: 'mc-demo-modal-async',
    template: `
    <button>
      <span>show modal</span>
    </button>
    <mc-modal>
      <p>content</p>
    </mc-modal>
  `,
    styles: []
})
class McDemoModalAsyncComponent {

}
