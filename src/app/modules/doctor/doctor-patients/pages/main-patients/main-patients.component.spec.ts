import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPatientsComponent } from './main-patients.component';

describe('MainPatientsComponent', () => {
  let component: MainPatientsComponent;
  let fixture: ComponentFixture<MainPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainPatientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
