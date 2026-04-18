import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorContainerComponent } from './doctor-container.component';

describe('DoctorContainerComponent', () => {
  let component: DoctorContainerComponent;
  let fixture: ComponentFixture<DoctorContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
