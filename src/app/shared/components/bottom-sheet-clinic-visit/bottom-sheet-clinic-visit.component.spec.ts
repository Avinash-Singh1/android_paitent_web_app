import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetClinicVisitComponent } from './bottom-sheet-clinic-visit.component';

describe('BottomSheetClinicVisitComponent', () => {
  let component: BottomSheetClinicVisitComponent;
  let fixture: ComponentFixture<BottomSheetClinicVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSheetClinicVisitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSheetClinicVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
