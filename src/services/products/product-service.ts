import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ProductListResponse } from './product-types';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private BASE_URL = environment.baseUrl
  private http = inject(HttpClient)

  getProducts(data: { page?: number, category?: string | null, search?: string | null } = { page: 0, category: null, search: null }) {
    const limit = 6;
    const skip = limit * (data.page ?? 0);
    return data.category && data.category !== null ?
      this.http.get<ProductListResponse>(`${this.BASE_URL}/products/category/${data.category}?limit=${limit}&skip=${skip}`) :
      data.search && data.search !== null ?
        this.http.get<ProductListResponse>(`${this.BASE_URL}/products/search?q=${data.search}&limit=${limit}&skip=${skip}`) : this.http.get<ProductListResponse>(`${this.BASE_URL}/products?limit=${limit}&skip=${skip}`)
  }

  getProductCategoriesList() {
    return this.http.get<Array<string>>(`${this.BASE_URL}/products/category-list`)
  }

}
