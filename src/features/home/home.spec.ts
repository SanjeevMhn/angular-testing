import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ProductService } from '../../services/products/product-service';
import { Home } from './home';
import { ActivatedRoute } from '@angular/router';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockProductService: any;

  const mockProducts = {
    products: [
      {
        id: 1,
        title: 'ProductA',
        thumbnail: 'test.jpg',
        price: 200,
      },
      {
        id: 2,
        title: 'ProductB',
        thumbnail: 'test2.jpg',
        price: 200,
      },
    ],
    total: 2,
  };

  const mockCategories = ['electronics', 'beauty'];
  const mockQueryParams = new BehaviorSubject<{ category: string | null }>({ category: null })

  beforeEach(async () => {
    mockProductService = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts)),
      getProductCategoriesList: vi.fn().mockReturnValue(of(mockCategories)),
    };
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: ProductService, useValue: mockProductService }, {
        provide: ActivatedRoute,
        useValue: {
          queryParams: mockQueryParams.asObservable()
        }
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Query Params', () => {
    let testScheduler: TestScheduler;
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toBe(expected);
      });
    });
    it('should filter product by category if category query params exists', () => {
      mockQueryParams.next({ category: 'beauty' })
      component.categoryParam$.subscribe(data => {
        expect(data.category).toBe('beauty')
      })
      component.activeCategory$.subscribe(data => {
        expect(data.category).toBe('beauty')
      })
      expect(component.currentActiveCategory).toBe('beauty')
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: 'beauty',
        search: null
      })
    })

    it('should remove category query params from url in case user searches for product', () => {
      mockQueryParams.next({ category: 'beauty' })
      const clearFilters = vi.spyOn(component, 'clearFilters')
      testScheduler.run(({ flush }) => {
        component.searchInputControl.setValue('apple')
        flush()
        expect(clearFilters).toHaveBeenCalled()
        expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
          page: 0,
          category: null,
          search: 'apple'
        })
      })
    })

    it('should remove category query params from url in case click on categories in the sidebar', () => {
      mockQueryParams.next({category: 'beauty'})
      const clearFilters = vi.spyOn(component, 'clearFilters')
      component.setActiveCategory('furniture')
      expect(clearFilters).toHaveBeenCalled()
    })

  });

  describe('Category Selection', () => {
    it('should update currentActiveCategory and trigger service call when category is clicked', () => {
      const category = 'electronics';
      component.setActiveCategory(category);
      expect(component.currentActiveCategory).toBe(category);
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: category,
        search: null,
      });
    });

    it('should reset category to null when "all" is selected', () => {
      component.setActiveCategory('all');
      expect(component.currentActiveCategory).toBe('all');
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: null,
        search: null,
      });
    });
  });

  describe('Search Functionality', () => {
    let testScheduler: TestScheduler;
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toBe(expected);
      });
    });

    it('should debounce search input and show clear using TestScheduler', () => {
      testScheduler.run(({ flush }) => {
        component.searchInputControl.setValue('apple');
        flush();
        expect(component.showClearButton).toBe(true);
        expect(mockProductService.getProducts).toHaveBeenCalledWith({
          page: 0,
          category: null,
          search: 'apple',
        });
      });
    });

    it('should clear search when clearSearch is called', () => {
      component.searchInputControl.setValue('apple');
      component.clearSearch();
      expect(component.searchInputControl.value).toBe(null);
      expect(component.showClearButton).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should display the correct number of products', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
      const productItems = compiled.querySelectorAll('.product-item');
      expect(productItems.length).toBe(2);
      expect(compiled.querySelector('.product-name')?.textContent).toContain('ProductA');
    });
    it('should show loading state when product$ is null', async () => {
      mockProductService.getProducts.mockReturnValue(of(null));
      component.pageNumber.next({ page: 0 }); //trigger the products$ observable

      fixture.detectChanges(); // Tell AsyncPipe to check for updates
      await fixture.whenStable(); // Wait for the observable to emit
      fixture.detectChanges(); // Update the DOM with the 'null' value

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContainer = compiled.querySelector('.loading-container');
      const productList = compiled.querySelector('.product-list');

      expect(loadingContainer).not.toBeNull();
      expect(loadingContainer?.textContent).toContain('Loading...');
      expect(productList).toBeNull();
    });
  });
});
