import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalAddressComponent } from './hospital-address.component';

describe('HospitalAddressComponent', () => {
  let component: HospitalAddressComponent;
  let fixture: ComponentFixture<HospitalAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalAddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
