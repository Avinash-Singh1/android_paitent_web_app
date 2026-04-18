import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalFaqsListComponent } from './hospital-faqs-list.component';

describe('HospitalFaqsListComponent', () => {
  let component: HospitalFaqsListComponent;
  let fixture: ComponentFixture<HospitalFaqsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalFaqsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalFaqsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
