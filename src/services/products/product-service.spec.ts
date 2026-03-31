import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';
import { ProductService } from './product-service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    const mockResponse = { products: [], total: 0 }
    it('should fetch all products with default pagination (limit=6, skip=0)', () => {
      service.getProducts().subscribe((res) => {
        expect(res).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${baseUrl}/products?limit=6&skip=0`);
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should fetch by category when category is provided', () => {
      const params = { category: 'apple', page: 0 }
      service.getProducts(params).subscribe()
      const req = httpMock.expectOne(`${baseUrl}/products/category/apple?limit=6&skip=0`);
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should fetch by search when search is provided', () => {
      const params = { search: 'apple', page: 0 }
      service.getProducts(params).subscribe()
      const req = httpMock.expectOne(`${baseUrl}/products/search?q=apple&limit=6&skip=0`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

  })

  describe('getProductCategoriesList', () => {
    it('should return an array of category string', () => {
      const mockCategories = ['beauty', 'electronics']
      service.getProductCategoriesList().subscribe((categories) => {
        expect(categories).toEqual(mockCategories)
        expect(categories.length).toBe(2)
      })
      const req = httpMock.expectOne(`${baseUrl}/products/category-list`)
      expect(req.request.method).toBe('GET')
      req.flush(mockCategories)
    })
  })

});
