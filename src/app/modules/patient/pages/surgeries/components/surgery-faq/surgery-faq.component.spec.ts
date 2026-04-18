import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryFaqComponent } from './surgery-faq.component';

describe('SurgeryFaqComponent', () => {
  let component: SurgeryFaqComponent;
  let fixture: ComponentFixture<SurgeryFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryFaqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
