import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTestimonialsComponent } from './client-testimonials.component';

describe('ClientTestimonialsComponent', () => {
  let component: ClientTestimonialsComponent;
  let fixture: ComponentFixture<ClientTestimonialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTestimonialsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
