import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularSurgeryComponent } from './popular-surgery.component';

describe('PopularSurgeryComponent', () => {
  let component: PopularSurgeryComponent;
  let fixture: ComponentFixture<PopularSurgeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopularSurgeryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PopularSurgeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
