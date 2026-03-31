import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, merge, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { ProductService } from '../../services/products/product-service';
import { ProductListResponse } from '../../services/products/product-types';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  productService = inject(ProductService)
  searchInputControl = new FormControl('');
  searchText = this.searchInputControl.valueChanges.pipe(
    debounceTime(800),
    distinctUntilChanged(),
    map((data) => {
      return { search: data }
    }),
    tap((data) => {
      if (data.search !== '' && data.search !== null) {
        this.showClearButton = true;
      } else {
        this.showClearButton = false
      }
      this.currentActiveCategory = 'all'
    })
  )
  showClearButton = false;
  currentActiveCategory: String = 'all'
  activeCategorySubject = new Subject<{ category: String | null }>();
  pageNumber = new BehaviorSubject<{ page: number }>({ page: 0 });

  products$: Observable<ProductListResponse | null> = merge(this.pageNumber, this.activeCategorySubject, this.searchText).pipe(
    switchMap((data) => {
      if (data !== null && typeof data == 'object') {
        let keyName = Object.keys(data)[0] as string;
        let value = (data as any)[keyName];
        let obj = {
          [keyName]: value
        };
        return this.productService.getProducts(obj);
      }
      return of(null);
    }));

  categoryList$: Observable<Array<string>> = this.productService.getProductCategoriesList();


  setActiveCategory(cat: string) {
    this.currentActiveCategory = cat;
    if (cat == 'all') {
      this.activeCategorySubject.next({ category: null })
    } else {
      this.activeCategorySubject.next({ category: cat })
    }
  }

  clearSearch() {
    this.searchInputControl.reset();
  }

}
