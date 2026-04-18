import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationQualificationComponent } from './education-qualification.component';

describe('EducationQualificationComponent', () => {
  let component: EducationQualificationComponent;
  let fixture: ComponentFixture<EducationQualificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationQualificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
