import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, map, of, switchMap, tap } from 'rxjs';
import { ProductService } from '../../services/products/product-service';

@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {

  readonly route = inject(ActivatedRoute)
  readonly productService = inject(ProductService)
  private productSubject = new BehaviorSubject<number | null>(null)

  productId$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    tap(id => {
      this.productSubject.next(Number(id))
    }))

  product$ = this.productSubject.pipe(
    switchMap((id) => {
      if (id == null) {
        return of(null)
      }
      console.log(id)
      return this.productService.getProductById(id)
    })
  )
}
