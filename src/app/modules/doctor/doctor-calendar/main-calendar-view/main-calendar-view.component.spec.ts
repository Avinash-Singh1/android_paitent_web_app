import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCalendarViewComponent } from './main-calendar-view.component';

describe('MainCalendarViewComponent', () => {
  let component: MainCalendarViewComponent;
  let fixture: ComponentFixture<MainCalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainCalendarViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
