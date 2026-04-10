import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { ProductDetail } from '../features/product-detail/product-detail';
import { Favorites } from '../features/favorites/favorites';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'favorites', component: Favorites },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'product-detail/:id', component: ProductDetail },
];
