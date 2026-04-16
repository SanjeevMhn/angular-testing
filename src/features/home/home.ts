import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ProductService } from '../../services/products/product-service';
import { ProductListResponse } from '../../services/products/product-types';

interface FilterState {
  page: number;
  category: string | null;
  search: string | null;
}

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly searchInputControl = new FormControl('');
  private readonly filterState = new BehaviorSubject<FilterState>({
    page: 0,
    category: null,
    search: null,
  });
  private readonly destroy$ = new Subject<void>();

  showClearButton = false;
  currentActiveCategory: string = 'all';

  private readonly currentPageData = { skip: 0, limit: 6 };
  totalPages = 0;
  currentPage = 1;

  readonly products$: Observable<ProductListResponse | null> = this.filterState.pipe(
    debounceTime(300),
    distinctUntilChanged(
      (prev, curr) =>
        prev.page === curr.page && prev.category === curr.category && prev.search === curr.search,
    ),
    switchMap((state) =>
      this.productService.getProducts({
        page: state.page,
        category: state.category,
        search: state.search,
      }),
    ),
    tap((data) => this.#updatePagination(data)),
  );

  readonly categoryList$: Observable<Array<string>> =
    this.productService.getProductCategoriesList();

  constructor() {
    this.route.queryParams
      .pipe(
        filter((data) => data['category']),
        map((params) => params['category']),
        takeUntil(this.destroy$),
      )
      .subscribe((category) => {
        this.currentActiveCategory = category;
        this.filterState.next({
          page: 0,
          category: category,
          search: null,
        });
      });

    this.searchInputControl.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        const currentState = this.filterState.getValue();
        this.filterState.next({
          page: 0,
          category: null,
          search: search || null,
        });
        this.showClearButton = search !== '' && search !== null;
        this.currentActiveCategory = 'all';
      });
  }

  // Pagination helpers
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      const currentState = this.filterState.getValue();
      this.filterState.next({ ...currentState, page: this.currentPage - 1 });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      const currentState = this.filterState.getValue();
      this.filterState.next({ ...currentState, page: this.currentPage - 1 });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageData.skip = (page - 1) * this.currentPageData.limit;
      const currentState = this.filterState.getValue();
      this.filterState.next({ ...currentState, page: this.currentPageData.skip });
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setActiveCategory(cat: string): void {
    this.currentActiveCategory = cat;
    const currentState = this.filterState.getValue();
    this.filterState.next({
      page: 0,
      category: cat === 'all' ? null : cat,
      search: null,
    });
    this.clearFilters();
  }

  clearSearch(): void {
    this.searchInputControl.reset();
    const currentState = this.filterState.getValue();
    this.filterState.next({
      ...currentState,
      page: 0,
      search: null,
    });
    this.showClearButton = false;
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

  clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: null,
    });
  }
}
