import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDashboardContainerComponent } from './main-dashboard-container.component';

describe('MainDashboardContainerComponent', () => {
  let component: MainDashboardContainerComponent;
  let fixture: ComponentFixture<MainDashboardContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainDashboardContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainDashboardContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
