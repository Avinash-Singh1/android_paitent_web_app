import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalslistingComponent } from './hospitalslisting.component';

describe('HospitalslistingComponent', () => {
  let component: HospitalslistingComponent;
  let fixture: ComponentFixture<HospitalslistingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalslistingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalslistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
