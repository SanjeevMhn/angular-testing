import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Rating } from "../../components/rating/rating";
import { ProductService } from '../../services/products/product-service';

@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, Rating, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnDestroy {

  readonly route = inject(ActivatedRoute)
  readonly productService = inject(ProductService)
  readonly productSubject = new BehaviorSubject<number | null>(null)

  private readonly destroy$ = new Subject<void>()
  activeImgIndex = signal(0)

  constructor() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      takeUntil(this.destroy$)).subscribe(id => {
        this.productSubject.next(Number(id))
      })
  }

  readonly product$ = this.productSubject.pipe(
    switchMap((id) => {
      if (id == null) {
        return of(null)
      }
      return this.productService.getProductById(id)
    })
  )

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
