import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileDepartSugeryComponent } from './mobile-depart-sugery.component';

describe('MobileDepartSugeryComponent', () => {
  let component: MobileDepartSugeryComponent;
  let fixture: ComponentFixture<MobileDepartSugeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileDepartSugeryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileDepartSugeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
