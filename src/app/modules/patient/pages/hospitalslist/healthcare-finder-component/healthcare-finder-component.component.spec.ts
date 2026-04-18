import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcareFinderComponentComponent } from './healthcare-finder-component.component';

describe('HealthcareFinderComponentComponent', () => {
  let component: HealthcareFinderComponentComponent;
  let fixture: ComponentFixture<HealthcareFinderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthcareFinderComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthcareFinderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
