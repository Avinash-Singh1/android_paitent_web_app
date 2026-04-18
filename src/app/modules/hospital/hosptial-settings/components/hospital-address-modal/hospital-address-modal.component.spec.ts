import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalAddressModalComponent } from './hospital-address-modal.component';

describe('HospitalAddressModalComponent', () => {
  let component: HospitalAddressModalComponent;
  let fixture: ComponentFixture<HospitalAddressModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalAddressModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
