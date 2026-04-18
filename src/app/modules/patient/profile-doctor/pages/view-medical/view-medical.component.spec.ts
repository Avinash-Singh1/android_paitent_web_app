import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMedicalComponent } from './view-medical.component';

describe('ViewMedicalComponent', () => {
  let component: ViewMedicalComponent;
  let fixture: ComponentFixture<ViewMedicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMedicalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
