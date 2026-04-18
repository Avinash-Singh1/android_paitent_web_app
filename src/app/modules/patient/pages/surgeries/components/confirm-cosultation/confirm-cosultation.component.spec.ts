import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCosultationComponent } from './confirm-cosultation.component';

describe('ConfirmCosultationComponent', () => {
  let component: ConfirmCosultationComponent;
  let fixture: ComponentFixture<ConfirmCosultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmCosultationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCosultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
