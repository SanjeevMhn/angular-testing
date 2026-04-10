import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { Product } from '../products/product-types';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    description: 'Test Description',
    category: 'test',
    price: 99.99,
    discountPercentage: 10,
    rating: 4.5,
    stock: 100,
    tags: ['test'],
    brand: 'TestBrand',
    sku: 'TEST-001',
    weight: 1,
    dimensions: { width: 10, height: 10, depth: 10 },
    warrantyInformation: '1 year',
    shippingInformation: 'Ships in 2 days',
    availabilityStatus: 'In Stock',
    reviews: [],
    returnPolicy: '30 days',
    minimumOrderQuantity: 1,
    meta: { createdAt: '2024-01-01', updatedAt: '2024-01-01', barcode: '123', qrCode: 'qr' },
    thumbnail: 'test.jpg',
    images: ['test.jpg'],
  };

  const mockProduct2: Product = { ...mockProduct, id: 2, title: 'Test Product 2' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoritesService],
    });
    service = TestBed.inject(FavoritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('add', () => {
    it('should add a product to favorites', () => {
      service.add(mockProduct);
      expect(service.favorites()).toContain(mockProduct);
      expect(service.count()).toBe(1);
    });

    it('should not add duplicate product', () => {
      service.add(mockProduct);
      service.add(mockProduct);
      expect(service.count()).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a product from favorites', () => {
      service.add(mockProduct);
      service.add(mockProduct2);
      service.remove(mockProduct.id);
      expect(service.favorites()).not.toContain(mockProduct);
      expect(service.favorites()).toContain(mockProduct2);
      expect(service.count()).toBe(1);
    });

    it('should do nothing when removing non-existent product', () => {
      service.add(mockProduct);
      service.remove(999);
      expect(service.count()).toBe(1);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited product', () => {
      service.add(mockProduct);
      expect(service.isFavorite(mockProduct.id)).toBeTruthy();
    });

    it('should return false for non-favorited product', () => {
      expect(service.isFavorite(mockProduct.id)).toBeFalsy();
    });
  });

  describe('toggle', () => {
    it('should add product when not favorited', () => {
      service.toggle(mockProduct);
      expect(service.isFavorite(mockProduct.id)).toBeTruthy();
    });

    it('should remove product when already favorited', () => {
      service.add(mockProduct);
      service.toggle(mockProduct);
      expect(service.isFavorite(mockProduct.id)).toBeFalsy();
    });
  });

  describe('clear', () => {
    it('should remove all favorites', () => {
      service.add(mockProduct);
      service.add(mockProduct2);
      service.clear();
      expect(service.favorites()).toEqual([]);
      expect(service.count()).toBe(0);
    });
  });
});
