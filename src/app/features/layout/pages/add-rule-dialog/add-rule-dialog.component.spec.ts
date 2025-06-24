import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRuleDialogComponent } from './add-rule-dialog.component';

describe('AddRuleDialogComponent', () => {
  let component: AddRuleDialogComponent;
  let fixture: ComponentFixture<AddRuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRuleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
