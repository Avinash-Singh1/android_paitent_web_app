import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalImagesComponent } from './hospital-images.component';

describe('HospitalImagesComponent', () => {
  let component: HospitalImagesComponent;
  let fixture: ComponentFixture<HospitalImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalImagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
