import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalAddTimingModalComponent } from './hospital-add-timing-modal.component';

describe('HospitalAddTimingModalComponent', () => {
  let component: HospitalAddTimingModalComponent;
  let fixture: ComponentFixture<HospitalAddTimingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalAddTimingModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalAddTimingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
