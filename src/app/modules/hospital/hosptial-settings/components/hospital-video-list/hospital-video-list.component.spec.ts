import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalVideoListComponent } from './hospital-video-list.component';

describe('HospitalVideoListComponent', () => {
  let component: HospitalVideoListComponent;
  let fixture: ComponentFixture<HospitalVideoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalVideoListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalVideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
