import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeConnectComponent } from './practice-connect.component';

describe('PracticeConnectComponent', () => {
  let component: PracticeConnectComponent;
  let fixture: ComponentFixture<PracticeConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PracticeConnectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
