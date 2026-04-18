import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorServicesComponent } from './doctor-services.component';

describe('DoctorServicesComponent', () => {
  let component: DoctorServicesComponent;
  let fixture: ComponentFixture<DoctorServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
