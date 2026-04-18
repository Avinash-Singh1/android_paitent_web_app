import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantFeesComponent } from './consultant-fees.component';

describe('ConsultantFeesComponent', () => {
  let component: ConsultantFeesComponent;
  let fixture: ComponentFixture<ConsultantFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultantFeesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
