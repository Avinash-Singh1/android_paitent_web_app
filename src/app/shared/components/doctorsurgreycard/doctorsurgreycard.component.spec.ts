import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsurgreycardComponent } from './doctorsurgreycard.component';

describe('DoctorsurgreycardComponent', () => {
  let component: DoctorsurgreycardComponent;
  let fixture: ComponentFixture<DoctorsurgreycardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorsurgreycardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsurgreycardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
