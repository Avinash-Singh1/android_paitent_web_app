import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDoctorsListComponent } from './find-doctors-list.component';

describe('FindDoctorsListComponent', () => {
  let component: FindDoctorsListComponent;
  let fixture: ComponentFixture<FindDoctorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindDoctorsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindDoctorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
