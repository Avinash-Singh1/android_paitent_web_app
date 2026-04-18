import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRequestListComponent } from './doctor-request-list.component';

describe('DoctorRequestListComponent', () => {
  let component: DoctorRequestListComponent;
  let fixture: ComponentFixture<DoctorRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorRequestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
