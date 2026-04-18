import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartSurgeryComponent } from './depart-surgery.component';

describe('DepartSurgeryComponent', () => {
  let component: DepartSurgeryComponent;
  let fixture: ComponentFixture<DepartSurgeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartSurgeryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartSurgeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
