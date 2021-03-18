import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McLink, McLinkModule } from './index';


describe('McLink', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McLinkModule, McIconModule],
            declarations: [
                McLinkBaseTestApp,
                McLinkIconTestApp,
                McLinkPrintTestApp,
                McLinkPseudoTestApp,
                McLinkUnderlinedTestApp
            ]
        });

        TestBed.compileComponents();
    }));

    it('should has .mc-text-only', () => {
        const fixture = TestBed.createComponent(McLinkBaseTestApp);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[mc-link]');

        expect(link.classList).toContain('mc-text-only');
        expect(link.classList).not.toContain('mc-text-with-icon');
        expect(link.attributes.tabIndex.nodeValue).toContain(0);
    });

    it('should has .mc-text-with-icon', () => {
        const fixture = TestBed.createComponent(McLinkIconTestApp);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[mc-link]');

        expect(link.classList).toContain('mc-text-with-icon');
        expect(link.classList).not.toContain('mc-text-only');
    });

    it('should has .mc-link_print', () => {
        const fixture = TestBed.createComponent(McLinkPrintTestApp);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[mc-link]');

        expect(link.classList).toContain('mc-link_print');
        expect(link.attributes.print.nodeValue).toContain('localhost:3003/');

        fixture.componentInstance.print = 'newUrl';
        fixture.detectChanges();
        expect(link.attributes.print.nodeValue).toContain(fixture.componentInstance.print);
    });

    it('should has .mc-link_pseudo', () => {
        const fixture = TestBed.createComponent(McLinkPseudoTestApp);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[mc-link]');

        expect(link.classList).toContain('mc-link_pseudo');
    });

    it('should has .mc-link_underlined', () => {
        const fixture = TestBed.createComponent(McLinkUnderlinedTestApp);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[mc-link]');

        expect(link.classList).toContain('mc-link_underlined');
    });
});


@Component({
    selector: 'mc-link-base-test-app',
    template: `
        <a href="http://localhost:3003/" mc-link>Отчет сканирования</a>
    `
})
class McLinkBaseTestApp {}

@Component({
    selector: 'mc-link-print-test-app',
    template: `
        <a href="http://localhost:3003/" mc-link [print]="print">Отчет сканирования</a>
    `
})
class McLinkPrintTestApp {
    print: string = '';
}

@Component({
    selector: 'mc-link-icon-test-app',
    template: `
        <a href="http://localhost:3003/" mc-link>
            <span class="mc-link__text">Отчет сканирования</span>
            <i mc-icon="mc-new-tab_16"></i>
        </a>
    `
})
class McLinkIconTestApp {}

@Component({
    selector: 'mc-link-pseudo-test-app',
    template: `
        <a href="http://localhost:3003/" mc-link pseudo>Отчет сканирования</a>
    `
})
class McLinkPseudoTestApp {}

@Component({
    selector: 'mc-link-underlined-test-app',
    template: `
        <a href="http://localhost:3003/" mc-link underlined>Отчет сканирования</a>
    `
})
class McLinkUnderlinedTestApp {}
