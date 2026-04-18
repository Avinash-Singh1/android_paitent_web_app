import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalSocialListComponent } from './hospital-social-list.component';

describe('HospitalSocialListComponent', () => {
  let component: HospitalSocialListComponent;
  let fixture: ComponentFixture<HospitalSocialListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalSocialListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalSocialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
