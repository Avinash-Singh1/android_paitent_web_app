import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalThemeComponent } from './hospital-theme.component';

describe('HospitalThemeComponent', () => {
  let component: HospitalThemeComponent;
  let fixture: ComponentFixture<HospitalThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalThemeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
