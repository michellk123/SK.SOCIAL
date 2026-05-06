import { Component } from '@angular/core';

@Component({
  selector: 'app-brands',
  standalone: true,
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss',
})
export class BrandsComponent {
  brands = [
    'assets/logos/brands/haan.jpeg',
    'assets/logos/brands/makeit.jpeg',
    'assets/logos/brands/vo.jpeg',
    'assets/logos/brands/einav_henna.jpeg',
    'assets/logos/brands/hstern.jpeg',
    'assets/logos/brands/shilat_design.jpeg',
    'assets/logos/brands/sagit_design.jpeg',
  ];
}
