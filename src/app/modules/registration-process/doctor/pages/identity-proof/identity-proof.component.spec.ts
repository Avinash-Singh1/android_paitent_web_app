import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityProofComponent } from './identity-proof.component';

describe('IdentityProofComponent', () => {
  let component: IdentityProofComponent;
  let fixture: ComponentFixture<IdentityProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentityProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
