import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDeleteModalComponent } from './hospital-delete-modal.component';

describe('HospitalDeleteModalComponent', () => {
  let component: HospitalDeleteModalComponent;
  let fixture: ComponentFixture<HospitalDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalDeleteModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
