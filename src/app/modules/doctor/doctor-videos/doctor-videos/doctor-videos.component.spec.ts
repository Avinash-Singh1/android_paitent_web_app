import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorVideosComponent } from './doctor-videos.component';

describe('DoctorVideosComponent', () => {
  let component: DoctorVideosComponent;
  let fixture: ComponentFixture<DoctorVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorVideosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
