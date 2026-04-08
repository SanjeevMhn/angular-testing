import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ProductService } from '../../services/products/product-service';
import { ProductListResponse } from '../../services/products/product-types';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  // Dependencies
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State Controls
  readonly searchInputControl = new FormControl('');
  activeCategorySubject = new Subject<{ category: string | null }>();
  pageNumber = new BehaviorSubject<{ page: number }>({ page: 0 });
  private readonly categoryParam$ = new BehaviorSubject<{ category: string | null }>({ category: null });
  private readonly destroy$ = new Subject<void>();

  // UI State
  showClearButton = false;
  currentActiveCategory: string = 'all';

  // Pagination State
  private readonly currentPageData = { skip: 0, limit: 6 };
  totalPages = 0;
  currentPage = 1;

  // Search text Observable, manages filter/clear/filter state
  readonly searchText: Observable<{ search: string | null }> = this.searchInputControl.valueChanges.pipe(
    debounceTime(800),
    distinctUntilChanged(),
    tap(() => this.#clearFilters()),
    map((data) => ({ search: data })),
    tap((data) => {
      this.pageNumber.next({ page: 0 });
      this.showClearButton = data.search !== '' && data.search !== null;
      this.currentActiveCategory = 'all';
    }),
  );

  // Category from param or user interaction (category select)
  readonly activeCategory$: Observable<{ category: string | null }> = merge(
    this.categoryParam$,
    this.activeCategorySubject,
  ).pipe(
    tap((categoryData) => {
      this.currentActiveCategory = categoryData.category !== null ? categoryData.category : 'all';
    }),
  );

  // Products (page, filter, search triggered)
  readonly products$: Observable<ProductListResponse | null> = combineLatest([
    this.pageNumber,
    this.activeCategory$.pipe(startWith(null)),
    this.searchText.pipe(startWith(null)),
  ]).pipe(
    switchMap(([page, category, search]) => {
      return this.productService.getProducts({
        page: (page as any)?.page ?? 0,
        category: (category as any)?.category ?? null,
        search: (search as any)?.search ?? null,
      });
    }),
    tap((data) => this.#updatePagination(data)),
  );

  // All available categories
  readonly categoryList$: Observable<Array<string>> = this.productService.getProductCategoriesList();

  constructor() {
    this.route.queryParams
      .pipe(
        filter((data) => data['category']),
        map((params) => ({ category: params['category'] })),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => this.categoryParam$.next(data));
  }

  // Pagination helpers
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageNumber.next({ page: this.currentPage - 1 });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageNumber.next({ page: this.currentPage - 1 });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageData.skip = (page - 1) * this.currentPageData.limit;
      this.pageNumber.next({ page: this.currentPageData.skip });
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setActiveCategory(cat: string): void {
    this.currentActiveCategory = cat;
    if (cat === 'all') {
      this.activeCategorySubject.next({ category: null });
    } else {
      this.activeCategorySubject.next({ category: cat });
    }
  }

  clearSearch(): void {
    this.searchInputControl.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  #updatePagination(data: ProductListResponse | null): void {
    if (data) {
      this.totalPages = Math.ceil(data.total / data.limit);
      this.currentPage = Math.floor(data.skip / data.limit) + 1;
    }
  }

  #clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: null,
    });
    this.categoryParam$.next({ category: null });
  }
}
