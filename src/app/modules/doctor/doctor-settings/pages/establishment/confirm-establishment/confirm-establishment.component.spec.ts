import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEstablishmentComponent } from './confirm-establishment.component';

describe('ConfirmEstablishmentComponent', () => {
  let component: ConfirmEstablishmentComponent;
  let fixture: ComponentFixture<ConfirmEstablishmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmEstablishmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmEstablishmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
