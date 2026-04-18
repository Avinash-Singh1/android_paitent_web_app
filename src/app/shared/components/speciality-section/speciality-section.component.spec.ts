import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialitySectionComponent } from './speciality-section.component';

describe('SpecialitySectionComponent', () => {
  let component: SpecialitySectionComponent;
  let fixture: ComponentFixture<SpecialitySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialitySectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialitySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
