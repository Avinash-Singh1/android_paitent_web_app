import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAppointmentModalComponent } from './delete-appointment-modal.component';

describe('DeleteAppointmentModalComponent', () => {
  let component: DeleteAppointmentModalComponent;
  let fixture: ComponentFixture<DeleteAppointmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAppointmentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAppointmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
