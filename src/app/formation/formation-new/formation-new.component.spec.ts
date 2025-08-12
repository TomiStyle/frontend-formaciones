import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationNewComponent } from './formation-new.component';

describe('FormationNewComponent', () => {
  let component: FormationNewComponent;
  let fixture: ComponentFixture<FormationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
