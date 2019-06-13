import { HttpTestingController } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DocsAppTestingModule } from '../../testing/testing-module';

import { DocViewer } from './doc-viewer';
import { DocViewerModule } from './doc-viewer-module';


describe('DocViewer', () => {
    let http: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [DocViewerModule, DocsAppTestingModule],
            declarations: [DocViewerTestComponent]
        }).compileComponents();
    }));

    beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
        http = h;
    }));

    it('should load doc into innerHTML', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocViewer));
        expect(docViewer).not.toBeNull();
        expect(docViewer.nativeElement.innerHTML).toBe('<div>my docs page</div>');
    });

    it('should save textContent of the doc', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocViewer));
        expect(docViewer.componentInstance.textContent).toBe('my docs page');
    });


    it('should correct hash based links', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.componentInstance.documentUrl = `http://mosaic.ptsecurity.com/doc-with-links.html`;
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocViewer));
        // Our test runner runs at the page /context.html, so it will be the prepended value.
        expect(docViewer.nativeElement.innerHTML).toContain(`/context.html#test"`);
    });
});

@Component({
    selector: 'test',
    template: `
        <doc-viewer [documentUrl]="documentUrl"></doc-viewer>`
})
class DocViewerTestComponent {
    documentUrl = 'http://mosaic.ptsecurity.com/simple-doc.html';
}

const FAKE_DOCS = {
    'http://mosaic.ptsecurity.com/simple-doc.html': '<div>my docs page</div>',
    'http://mosaic.ptsecurity.com/doc-with-example.html': `
      <div>Check out this example:</div>
      <div mosaic-docs-example="some-example"></div>`,
    'http://mosaic.ptsecurity.com/doc-with-links.html': `<a href="#test">Test link</a>`,
    'http://mosaic.ptsecurity.com/doc-with-element-ids.html': `<h4 id="my-header">Header</h4>`
};
