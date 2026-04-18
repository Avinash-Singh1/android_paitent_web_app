import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentBasicDetailsComponent } from './establishment-basic-details.component';

describe('EstablishmentBasicDetailsComponent', () => {
  let component: EstablishmentBasicDetailsComponent;
  let fixture: ComponentFixture<EstablishmentBasicDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstablishmentBasicDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentBasicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
