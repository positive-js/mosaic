import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';

import { McButtonModule } from './index';


describe('McDl', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));
});

@Component({
    selector: 'test-app',
    template: ``
})
class TestApp {}
