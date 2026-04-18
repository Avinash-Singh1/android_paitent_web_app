import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAppointmnetComponent } from './book-appointmnet.component';

describe('BookAppointmnetComponent', () => {
  let component: BookAppointmnetComponent;
  let fixture: ComponentFixture<BookAppointmnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookAppointmnetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookAppointmnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
