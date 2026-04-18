import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentRequestComponent } from './establishment-request.component';

describe('EstablishmentRequestComponent', () => {
  let component: EstablishmentRequestComponent;
  let fixture: ComponentFixture<EstablishmentRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstablishmentRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
