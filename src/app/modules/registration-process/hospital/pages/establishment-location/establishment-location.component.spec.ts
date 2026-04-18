import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentLocationComponent } from './establishment-location.component';

describe('EstablishmentLocationComponent', () => {
  let component: EstablishmentLocationComponent;
  let fixture: ComponentFixture<EstablishmentLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstablishmentLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
