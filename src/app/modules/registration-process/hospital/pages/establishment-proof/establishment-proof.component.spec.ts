import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentProofComponent } from './establishment-proof.component';

describe('EstablishmentProofComponent', () => {
  let component: EstablishmentProofComponent;
  let fixture: ComponentFixture<EstablishmentProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstablishmentProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
