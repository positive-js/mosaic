import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McContentComponent } from './content.component';
import { McFooterComponent } from './footer.component';
import { McHeaderComponent } from './header.component';
import { McLayoutComponent } from './layout.component';
import { McLayoutModule } from './layout.module';
import { McSidebarComponent } from './sidebar.component';


describe('Layout', () => {

    let testComponent;
    let fixture;

    describe('check basic style', () => {
        let headers;
        let contents;
        let footers;
        let sidebars;
        let layouts;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ McLayoutModule ],
                declarations: [ McDemoLayoutBasicComponent ],
                providers: []
            });

            TestBed.compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(McDemoLayoutBasicComponent);
            testComponent = fixture.debugElement.componentInstance;
            headers = fixture.debugElement.queryAll(By.directive(McHeaderComponent));
            contents = fixture.debugElement.queryAll(By.directive(McContentComponent));
            footers = fixture.debugElement.queryAll(By.directive(McFooterComponent));
            sidebars = fixture.debugElement.queryAll(By.directive(McSidebarComponent));
            layouts = fixture.debugElement.queryAll(By.directive(McLayoutComponent));
        });

        it('should have correct class', () => {
            fixture.detectChanges();
            expect(headers.every((header) => header.nativeElement.classList.contains('mc-layout-header'))).toBe(true);
            expect(layouts.every((layout) => layout.nativeElement.classList.contains('mc-layout'))).toBe(true);
            expect(contents.every((content) =>
                content.nativeElement.classList.contains('mc-layout-content'))).toBe(true);

            expect(footers.every((footer) =>
                footer.nativeElement.classList.contains('mc-layout-footer'))).toBe(true);
            expect(sidebars.every((sidebar) =>
                sidebar.nativeElement.classList.contains('mc-layout-sidebar'))).toBe(true);

            const matchToCSS = 'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;';
            expect(sidebars.every((sidebar) =>
                sidebar.nativeElement.style.cssText === matchToCSS)).toBe(true);

            /* tslint:disable:no-magic-numbers */
            expect(layouts[ 2 ].nativeElement.classList.contains('mc-layout-has-sidebar')).toBe(true);
            expect(layouts[ 4 ].nativeElement.classList.contains('mc-layout-has-sidebar')).toBe(true);
            expect(layouts[ 5 ].nativeElement.classList.contains('mc-layout-has-sidebar')).toBe(true);
        });
    });
});

@Component({
    selector: 'mc-demo-layout-basic',
    template: `
    <mc-layout>
      <mc-header>Header</mc-header>
      <mc-content>Content</mc-content>
      <mc-footer>Footer</mc-footer>
    </mc-layout>
    <mc-layout>
      <mc-header>Header</mc-header>
      <mc-layout>
        <mc-sidebar>Sidebar</mc-sidebar>
        <mc-content>Content</mc-content>
      </mc-layout>
      <mc-footer>Footer</mc-footer>
    </mc-layout>
    <mc-layout>
      <mc-header>Header</mc-header>
      <mc-layout>
        <mc-content>Content</mc-content>
        <mc-sidebar>Sidebar</mc-sidebar>
      </mc-layout>
      <mc-footer>Footer</mc-footer>
    </mc-layout>
    <mc-layout>
      <mc-sidebar>Sidebar</mc-sidebar>
      <mc-layout>
        <mc-header>Header</mc-header>
        <mc-content>Content</mc-content>
        <mc-footer>Footer</mc-footer>
      </mc-layout>
    </mc-layout>
  `,
    styles  : [ `
    :host {
      text-align: center;
    }
    :host ::ng-deep .mc-layout-header,
    :host ::ng-deep .mc-layout-footer {
      background: #7dbcea;
      color: #fff;
    }
    :host ::ng-deep .mc-layout-footer {
      line-height: 1.5;
    }
    :host ::ng-deep .mc-layout-sidebar {
      background: #3ba0e9;
      color: #fff;
      line-height: 120px;
    }
    :host ::ng-deep .mc-layout-content {
      background: rgba(16, 142, 233, 1);
      color: #fff;
      min-height: 120px;
      line-height: 120px;
    }
    :host > ::ng-deep .mc-layout {
      margin-bottom: 48px;
    }
    :host ::ng-deep .mc-layout:last-child {
      margin: 0;
    }
  ` ]
})
class McDemoLayoutBasicComponent {
}
