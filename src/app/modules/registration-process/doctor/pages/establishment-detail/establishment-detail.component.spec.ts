import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentDetailComponent } from './establishment-detail.component';

describe('EstablishmentDetailComponent', () => {
  let component: EstablishmentDetailComponent;
  let fixture: ComponentFixture<EstablishmentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstablishmentDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
