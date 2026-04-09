import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Rating } from './rating';

@Component({
  imports: [Rating],
  template: `<app-rating [rating]="ratingValue" />`,
})
class TestHostComponent {
  ratingValue = 4;
}

describe('Rating', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const ratingComponent = fixture.debugElement.children[0].componentInstance;
    expect(ratingComponent).toBeTruthy();
  });
});
