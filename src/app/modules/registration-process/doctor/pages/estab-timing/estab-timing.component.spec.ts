import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstabTimingComponent } from './estab-timing.component';

describe('EstabTimingComponent', () => {
  let component: EstabTimingComponent;
  let fixture: ComponentFixture<EstabTimingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstabTimingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstabTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
