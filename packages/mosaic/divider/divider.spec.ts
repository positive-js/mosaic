import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McDividerModule } from './divider.module';


describe('McDivider', () => {

  let fixture: ComponentFixture<McDividerTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [McDividerModule],
      declarations: [
          McDividerTestComponent
      ]
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(McDividerTestComponent);
  }));

  it('should apply vertical class to vertical divider', () => {
    fixture.componentInstance.vertical = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider_vertical');
  });

  it('should apply inset class to inset divider', () => {
    fixture.componentInstance.inset = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider_inset');
  });

  it('should apply inset and vertical classes to vertical inset divider', () => {
    fixture.componentInstance.vertical = true;
    fixture.componentInstance.inset = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider_inset');
    expect(divider.nativeElement.className).toContain('mc-divider_vertical');
  });

  it('should add aria roles properly', () => {
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.getAttribute('role')).toBe('separator');
  });
});

@Component({
  template: `<mc-divider [vertical]="vertical" [inset]="inset"></mc-divider>`
})
class McDividerTestComponent {
  vertical: boolean;
  inset: boolean;
}
