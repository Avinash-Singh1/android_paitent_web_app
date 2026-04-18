import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalProcessComponent } from './hospital-process.component';

describe('HospitalProcessComponent', () => {
  let component: HospitalProcessComponent;
  let fixture: ComponentFixture<HospitalProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalProcessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
