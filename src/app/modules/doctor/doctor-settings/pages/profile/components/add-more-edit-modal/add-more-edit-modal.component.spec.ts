import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMoreEditModalComponent } from './add-more-edit-modal.component';

describe('AddMoreEditModalComponent', () => {
  let component: AddMoreEditModalComponent;
  let fixture: ComponentFixture<AddMoreEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMoreEditModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMoreEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
