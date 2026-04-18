import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicslistingsComponent } from './clinicslistings.component';

describe('ClinicslistingsComponent', () => {
  let component: ClinicslistingsComponent;
  let fixture: ComponentFixture<ClinicslistingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicslistingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicslistingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
