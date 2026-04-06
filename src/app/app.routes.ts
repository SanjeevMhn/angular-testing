import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { ProductDetail } from '../features/product-detail/product-detail';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'product-detail/:id', component: ProductDetail }
];
