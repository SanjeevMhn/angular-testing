import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Favorites } from './favorites';
import { FavoritesService } from '../../services/favorites/favorites.service';
import { Product } from '../../services/products/product-types';

describe('Favorites', () => {
  let component: Favorites;
  let fixture: ComponentFixture<Favorites>;
  let favoritesService: FavoritesService;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favorites, RouterTestingModule],
      providers: [FavoritesService],
    }).compileComponents();

    fixture = TestBed.createComponent(Favorites);
    component = fixture.componentInstance;
    favoritesService = TestBed.inject(FavoritesService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when no favorites', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('h2')?.textContent).toContain('No favorites yet');
  });

  it('should display favorites when products are added', () => {
    favoritesService.add(mockProduct);
    favoritesService.add(mockProduct2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeFalsy();
    expect(compiled.querySelector('h1')?.textContent).toContain('2');
    expect(compiled.querySelectorAll('.product-card').length).toBe(2);
  });

  it('should display correct product title', () => {
    favoritesService.add(mockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockProduct.title);
  });

  it('should display correct product price', () => {
    favoritesService.add(mockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(`$${mockProduct.price}`);
  });

  it('should remove product when remove button is clicked', () => {
    favoritesService.add(mockProduct);
    favoritesService.add(mockProduct2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButtons = compiled.querySelectorAll('button');
    removeButtons[0].click();
    fixture.detectChanges();

    expect(favoritesService.count()).toBe(1);
    expect(favoritesService.favorites()).toHaveLength(1);
  });

  it('should show empty state after removing all products', () => {
    favoritesService.add(mockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButtons = compiled.querySelectorAll('button');
    removeButtons[0].click();
    fixture.detectChanges();

    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should update count dynamically', () => {
    expect(favoritesService.count()).toBe(0);
    fixture.detectChanges();

    favoritesService.add(mockProduct);
    fixture.detectChanges();
    expect(favoritesService.count()).toBe(1);

    favoritesService.add(mockProduct2);
    fixture.detectChanges();
    expect(favoritesService.count()).toBe(2);
  });

  it('should have link to browse products in empty state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const browseLink = compiled.querySelector('a[routerLink="/home"]');
    expect(browseLink).toBeTruthy();
  });

  it('should have link to product detail', () => {
    favoritesService.add(mockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const productLink = compiled.querySelector(`a[href="/product/${mockProduct.id}"]`);
    expect(productLink).toBeTruthy();
  });
});
