import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Rating } from '../../components/rating/rating';
import { ProductService } from '../../services/products/product-service';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;
  let mockProductService: any;
  let mockParams: BehaviorSubject<any>;

  const mockProduct = {
    id: 2,
    title: 'Eyeshadow Palette with Mirror',
    description:
      "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
    category: 'beauty',
    price: 19.99,
    discountPercentage: 18.19,
    rating: 2.86,
    stock: 34,
    tags: ['beauty', 'eyeshadow'],
    brand: 'Glamour Beauty',
    sku: 'BEA-GLA-EYE-002',
    weight: 9,
    dimensions: {
      width: 9.26,
      height: 22.47,
      depth: 27.67,
    },
    warrantyInformation: '1 year warranty',
    shippingInformation: 'Ships in 2 weeks',
    availabilityStatus: 'In Stock',
    reviews: [
      {
        rating: 5,
        comment: 'Great product!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Savannah Gomez',
        reviewerEmail: 'savannah.gomez@x.dummyjson.com',
      },
      {
        rating: 4,
        comment: 'Awesome product!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Christian Perez',
        reviewerEmail: 'christian.perez@x.dummyjson.com',
      },
      {
        rating: 1,
        comment: 'Poor quality!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Nicholas Bailey',
        reviewerEmail: 'nicholas.bailey@x.dummyjson.com',
      },
    ],
    returnPolicy: '7 days return policy',
    minimumOrderQuantity: 20,
    meta: {
      createdAt: '2025-04-30T09:41:02.053Z',
      updatedAt: '2025-04-30T09:41:02.053Z',
      barcode: '9170275171413',
      qrCode: 'https://cdn.dummyjson.com/public/qr-code.png',
    },
    images: [
      'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp',
    ],
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
  };

  beforeEach(async () => {
    mockParams = new BehaviorSubject(convertToParamMap({ id: '1' }));
    mockProductService = {
      getProductById: vi.fn().mockReturnValue(of(mockProduct)),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetail, Rating],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: mockParams.asObservable(),
          },
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should push the correct product id from route to productSubject', async () => {
    const expectedId = 5;
    mockParams.next(convertToParamMap({ id: String(expectedId) }));
    await fixture.whenStable();
    const value = component.productSubject.getValue();
    expect(value).toBe(expectedId);
  });

  it('product$ should emit product data for the given id', async () => {
    const testId = 2;
    mockParams.next(convertToParamMap({ id: String(testId) }));
    await fixture.whenStable();

    component.product$.subscribe((product) => {
      expect(mockProductService.getProductById).toHaveBeenCalledWith(testId);
      expect(product).toEqual(mockProduct);
    });
  });

  it('product$ should emit null when productSubject is null', async () => {
    component.productSubject.next(null);
    await fixture.whenStable();

    component.product$.subscribe((product) => {
      expect(product).toBeNull();
    });
  });
});
