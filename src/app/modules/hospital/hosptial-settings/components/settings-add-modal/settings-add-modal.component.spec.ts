import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAddModalComponent } from './settings-add-modal.component';

describe('SettingsAddModalComponent', () => {
  let component: SettingsAddModalComponent;
  let fixture: ComponentFixture<SettingsAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAddModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
