import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { ProductService } from '../../services/products/product-service';
import { Home } from './home';
import { ActivatedRoute, Router } from '@angular/router';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockProductService: any;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let productsSubscription: Subscription | null = null;

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
    limit: 6,
    skip: 0,
  };

  const mockCategories = ['electronics', 'beauty'];

  beforeEach(async () => {
    vi.useFakeTimers();
    mockProductService = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts)),
      getProductCategoriesList: vi.fn().mockReturnValue(of(mockCategories)),
    };
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };
  });

  afterEach(() => {
    productsSubscription?.unsubscribe();
    productsSubscription = null;
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  async function createComponent(queryParams: BehaviorSubject<any>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams.asObservable() } },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;

    // Explicit subscription makes service-side effects deterministic in tests.
    productsSubscription = component.products$.subscribe();
    vi.advanceTimersByTime(300);
  }

  it('should create', async () => {
    await createComponent(new BehaviorSubject<{}>({}));
    expect(component).toBeTruthy();
  });

  describe('Query Params', () => {
    it('should filter product by category if category query params exists', async () => {
      const queryParams = new BehaviorSubject<{ category: string }>({ category: 'beauty' });
      await createComponent(queryParams);

      expect(component.currentActiveCategory).toBe('beauty');
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: 'beauty',
        search: null,
      });
    });

    it('should reset to search when user searches for product', async () => {
      const queryParams = new BehaviorSubject<{ category: string }>({ category: 'beauty' });
      await createComponent(queryParams);

      component.searchInputControl.setValue('apple');
      vi.advanceTimersByTime(800);
      vi.advanceTimersByTime(300);

      expect(component.currentActiveCategory).toBe('all');
      expect(component.showClearButton).toBe(true);
      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 0,
        category: null,
        search: 'apple',
      });
    });

    it('should update category when click on categories in the sidebar', async () => {
      const queryParams = new BehaviorSubject<{ category: string }>({ category: 'beauty' });
      await createComponent(queryParams);

      component.setActiveCategory('furniture');

      expect(component.currentActiveCategory).toBe('furniture');
      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 0,
        category: 'furniture',
        search: null,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: {},
        queryParamsHandling: null,
      });
    });
  });

  describe('Category Selection', () => {
    it('should update currentActiveCategory and trigger service call when category is clicked', async () => {
      await createComponent(new BehaviorSubject<{}>({}));

      const category = 'electronics';
      component.setActiveCategory(category);
      expect(component.currentActiveCategory).toBe(category);
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: category,
        search: null,
      });
    });

    it('should reset category to null when "all" is selected', async () => {
      await createComponent(new BehaviorSubject<{}>({}));

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
    it('should debounce search input and show clear button', async () => {
      await createComponent(new BehaviorSubject<{}>({}));

      component.searchInputControl.setValue('apple');
      vi.advanceTimersByTime(800);
      vi.advanceTimersByTime(300);

      expect(component.showClearButton).toBe(true);
      expect(mockProductService.getProducts).toHaveBeenCalledWith({
        page: 0,
        category: null,
        search: 'apple',
      });
    });

    it('should clear search when clearSearch is called', async () => {
      await createComponent(new BehaviorSubject<{}>({}));

      component.searchInputControl.setValue('apple');
      vi.advanceTimersByTime(800);
      vi.advanceTimersByTime(300);
      component.clearSearch();
      vi.advanceTimersByTime(300);
      expect(component.searchInputControl.value).toBe(null);
      expect(component.showClearButton).toBe(false);
      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 0,
        category: null,
        search: null,
      });
    });
  });

  describe('Pagination', () => {
    it('should update pagination metadata from the initial response', async () => {
      mockProductService.getProducts.mockReturnValue(
        of({
          ...mockProducts,
          total: 25,
          limit: 6,
          skip: 0,
        }),
      );
      await createComponent(new BehaviorSubject<{}>({}));

      expect(component.totalPages).toBe(5);
      expect(component.currentPage).toBe(1);
      expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should move to next page when possible', async () => {
      mockProductService.getProducts.mockReturnValue(
        of({
          ...mockProducts,
          total: 18,
          limit: 6,
          skip: 0,
        }),
      );
      await createComponent(new BehaviorSubject<{}>({}));

      component.nextPage();
      vi.advanceTimersByTime(300);

      expect(component.currentPage).toBe(2);
      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 1,
        category: null,
        search: null,
      });
    });

    it('should move to previous page when current page is greater than 1', async () => {
      mockProductService.getProducts.mockReturnValue(
        of({
          ...mockProducts,
          total: 18,
          limit: 6,
          skip: 6,
        }),
      );
      await createComponent(new BehaviorSubject<{}>({}));
      expect(component.currentPage).toBe(2);

      component.prevPage();
      vi.advanceTimersByTime(300);

      expect(component.currentPage).toBe(1);
      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 0,
        category: null,
        search: null,
      });
    });

    it('should go to a specific page when page is in range', async () => {
      mockProductService.getProducts.mockReturnValue(
        of({
          ...mockProducts,
          total: 25,
          limit: 6,
          skip: 0,
        }),
      );
      await createComponent(new BehaviorSubject<{}>({}));

      component.goToPage(3);
      vi.advanceTimersByTime(300);

      expect(mockProductService.getProducts).toHaveBeenLastCalledWith({
        page: 12,
        category: null,
        search: null,
      });
    });
  });

  describe('Template Rendering', () => {
    it('should display the correct number of products', async () => {
      await createComponent(new BehaviorSubject<{}>({}));

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const productItems = compiled.querySelectorAll('.product-item');
      expect(productItems.length).toBe(2);
      expect(compiled.querySelector('.product-name')?.textContent).toContain('ProductA');
    });

    it('should show loading state when product$ is null', async () => {
      mockProductService.getProducts.mockReturnValue(of(null));
      await createComponent(new BehaviorSubject<{}>({}));

      component.searchInputControl.setValue('');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingContainer = compiled.querySelector('.loading-container');
      const productList = compiled.querySelector('.product-list');

      expect(loadingContainer).not.toBeNull();
      expect(loadingContainer?.textContent).toContain('Loading...');
      expect(productList).toBeNull();
    });
  });
});
