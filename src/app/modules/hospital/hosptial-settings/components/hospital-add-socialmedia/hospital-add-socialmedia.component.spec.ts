import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalAddSocialmediaComponent } from './hospital-add-socialmedia.component';

describe('HospitalAddSocialmediaComponent', () => {
  let component: HospitalAddSocialmediaComponent;
  let fixture: ComponentFixture<HospitalAddSocialmediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalAddSocialmediaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalAddSocialmediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
