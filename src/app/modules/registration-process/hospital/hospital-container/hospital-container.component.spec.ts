import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalContainerComponent } from './hospital-container.component';

describe('HospitalContainerComponent', () => {
  let component: HospitalContainerComponent;
  let fixture: ComponentFixture<HospitalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
