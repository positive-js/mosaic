import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatDividerModule} from './divider-module';


describe('MatDivider', () => {

  let fixture: ComponentFixture<MatDividerTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDividerModule],
      declarations: [
        MatDividerTestComponent
      ],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(MatDividerTestComponent);
  }));

  it('should apply vertical class to vertical divider', () => {
    fixture.componentInstance.vertical = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider-vertical');
  });

  it('should apply inset class to inset divider', () => {
    fixture.componentInstance.inset = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider-inset');
  });

  it('should apply inset and vertical classes to vertical inset divider', () => {
    fixture.componentInstance.vertical = true;
    fixture.componentInstance.inset = true;
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mc-divider'));
    expect(divider.nativeElement.className).toContain('mc-divider');
    expect(divider.nativeElement.className).toContain('mc-divider-inset');
    expect(divider.nativeElement.className).toContain('mc-divider-vertical');
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
class MatDividerTestComponent {
  vertical: boolean;
  inset: boolean;
}
