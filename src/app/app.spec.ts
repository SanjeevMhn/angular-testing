import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should contain main-container div', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const mainContainer = compiled.querySelector('.main-container');
    expect(mainContainer).toBeTruthy();
  });
});
