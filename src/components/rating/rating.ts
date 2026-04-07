import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating',
  imports: [],
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class Rating {

  rating = input.required<number>()

  getRatingStars = computed(() => Array(Math.ceil(this.rating())))
  getEmptyStars = computed(() => Array(5 - this.getRatingStars().length))

}
