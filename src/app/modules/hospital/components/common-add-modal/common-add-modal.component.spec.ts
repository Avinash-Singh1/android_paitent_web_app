import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonAddModalComponent } from './common-add-modal.component';

describe('CommonAddModalComponent', () => {
  let component: CommonAddModalComponent;
  let fixture: ComponentFixture<CommonAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonAddModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
