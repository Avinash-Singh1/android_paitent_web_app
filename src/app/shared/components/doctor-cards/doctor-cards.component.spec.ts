import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCardsComponent } from './doctor-cards.component';

describe('DoctorCardsComponent', () => {
  let component: DoctorCardsComponent;
  let fixture: ComponentFixture<DoctorCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
