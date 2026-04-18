import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageViewModalComponent } from './image-view-modal.component';

describe('ImageViewModalComponent', () => {
  let component: ImageViewModalComponent;
  let fixture: ComponentFixture<ImageViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageViewModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
