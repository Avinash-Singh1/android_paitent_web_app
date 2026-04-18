import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFaqsComponent } from './doctor-faqs.component';

describe('DoctorFaqsComponent', () => {
  let component: DoctorFaqsComponent;
  let fixture: ComponentFixture<DoctorFaqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFaqsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
