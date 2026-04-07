import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  tap
} from 'rxjs';
import { ProductService } from '../../services/products/product-service';
import { ProductListResponse } from '../../services/products/product-types';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  productService = inject(ProductService);
  route = inject(ActivatedRoute)
  router = inject(Router)

  searchInputControl = new FormControl('');
  searchText = this.searchInputControl.valueChanges.pipe(
    debounceTime(800),
    distinctUntilChanged(),
    map((data) => {
      return { search: data };
    }),
    tap((data) => {
      this.pageNumber.next({ page: 0 });
      if (data.search !== '' && data.search !== null) {
        this.showClearButton = true;
      } else {
        this.showClearButton = false;
      }
      this.currentActiveCategory = 'all';
    }),
  );
  showClearButton = false;
  currentActiveCategory: String = 'all';
  activeCategorySubject = new Subject<{ category: String | null }>();
  pageNumber = new BehaviorSubject<{ page: number }>({ page: 0 });

  categoryParam$ = this.route.queryParams.pipe(
    filter(data => data['category']),
    map(params => {
      return { category: params['category'] }
    }),
  )
  activeCategory$ = merge(this.categoryParam$, this.activeCategorySubject).pipe(
    tap(data => {
      this.currentActiveCategory = data.category
    })
  )

  products$: Observable<ProductListResponse | null> = combineLatest([
    this.pageNumber,
    this.activeCategory$.pipe(startWith(null)),
    this.searchText.pipe(startWith(null)),
  ]).pipe(
    switchMap(([page, category, search]) => {
      console.log(category, search)
      return this.productService.getProducts({
        page: (page as any)?.page ?? 0,
        category: (category as any)?.category ?? null,
        search: (search as any)?.search ?? null,
      });
    }),
    tap(data =>
      this.updatePagination(data)
    )
  );

  categoryList$: Observable<Array<string>> = this.productService.getProductCategoriesList();

  currentPageData = { skip: 0, limit: 6 };
  totalPages = 0;
  currentPage = 1;

  updatePagination(data: ProductListResponse | null) {
    if (data) {
      this.totalPages = Math.ceil(data.total / data.limit);
      this.currentPage = Math.floor(data.skip / data.limit) + 1;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageNumber.next({ page: this.currentPage - 1 });
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageNumber.next({ page: this.currentPage - 1 });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageData.skip = (page - 1) * this.currentPageData.limit;
      this.pageNumber.next({ page: this.currentPageData.skip });
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setActiveCategory(cat: string) {
    this.currentActiveCategory = cat;
    if (cat == 'all') {
      this.activeCategorySubject.next({ category: null });
    } else {
      this.activeCategorySubject.next({ category: cat });
    }
  }

  clearSearch() {
    this.searchInputControl.reset();
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}, // Set to empty
      queryParamsHandling: null, // This is the default, it replaces existing params
    });
  }
}
