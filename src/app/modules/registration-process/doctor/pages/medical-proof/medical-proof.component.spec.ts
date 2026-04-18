import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalProofComponent } from './medical-proof.component';

describe('MedicalProofComponent', () => {
  let component: MedicalProofComponent;
  let fixture: ComponentFixture<MedicalProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
