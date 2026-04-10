import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../products/product-types';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly favoritesSignal = signal<Product[]>([]);

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly count = computed(() => this.favoritesSignal().length);

  add(product: Product): void {
    if (!this.isFavorite(product.id)) {
      this.favoritesSignal.update((favorites) => [...favorites, product]);
    }
  }

  remove(productId: number): void {
    this.favoritesSignal.update((favorites) => favorites.filter((p) => p.id !== productId));
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSignal().some((p) => p.id === productId);
  }

  toggle(product: Product): void {
    if (this.isFavorite(product.id)) {
      this.remove(product.id);
    } else {
      this.add(product);
    }
  }

  clear(): void {
    this.favoritesSignal.set([]);
  }
}
