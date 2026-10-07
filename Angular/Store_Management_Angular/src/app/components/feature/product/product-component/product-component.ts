import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators
} from '@angular/forms';

import { ProductService } from '../../../../services/product.service';
import {
  ProductRequestModel,
  ProductResponseModel
} from '../../../../model/product.model';

import { CategoryService } from '../../../../services/category.service';
import { CategoryResponseModel } from '../../../../model/category.model';
import { BranchResponse } from '../../../../model/branch.model';
import { BranchService } from '../../../../services/branch-service';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './product-component.html',
  styleUrls: ['./product-component.css']
})
export class ProductComponent implements OnInit {

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private branchService = inject(BranchService);



  products: ProductResponseModel[] = [];
  categories: CategoryResponseModel[] = [];
  branches: BranchResponse[] = [];
  
filteredProducts: ProductResponseModel[] = [];

searchText = '';

  editing = false;
  editingId = 0;

  productForm = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    barcode: [''],
    costPrice: [0, Validators.required],
    sellingPrice: [0, Validators.required],
    unit: [''],
    taxRate: [0],
    categoryId: [null as number | null, Validators.required],
    branchId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadBranches();
  }

  loadProducts(): void {
  this.productService.getAllProducts().subscribe({
    next: (data) => {
      this.products = data;
      this.filteredProducts = data;
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error(err);
    }
  });
}
  loadCategories(): void {
  this.categoryService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
      this.cdr.markForCheck();
    },
    error: (err) => console.error(err)
  });
}

  loadBranches(): void {
  this.branchService.getAll().subscribe({
    next: (data) => {
      this.branches = data;
      this.cdr.markForCheck();
    },
    error: (err) => console.error(err)
  });
}

  save(): void {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue() as ProductRequestModel;

    console.log(product);

    if (this.editing) {

      this.productService.updateProduct(this.editingId, product).subscribe({
        next: () => {
          alert('Product Updated Successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => console.error(err)
      });

    } else {

      this.productService.createProduct(product).subscribe({
        next: () => {
          alert('Product Saved Successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => console.error(err)
      });

    }
  }

  edit(product: ProductResponseModel): void {

    this.editing = true;
    this.editingId = product.id;

    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      unit: product.unit,
      taxRate: product.taxRate,
      categoryId: product.categoryId,
      branchId: product.branchId
    });

  }

  delete(id: number): void {

    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        alert('Product Deleted Successfully');
        this.loadProducts();
      },
      error: (err) => console.error(err)
    });

  }
  searchProduct(): void {

  const keyword = this.searchText.toLowerCase().trim();

  this.filteredProducts = this.products.filter(product =>
    product.name.toLowerCase().includes(keyword) ||
    product.sku.toLowerCase().includes(keyword) ||
    product.categoryName.toLowerCase().includes(keyword) ||
    product.branchName.toLowerCase().includes(keyword)
  );

}
  resetForm(): void {

    this.editing = false;
    this.editingId = 0;

    this.productForm.reset({
      name: '',
      sku: '',
      barcode: '',
      costPrice: 0,
      sellingPrice: 0,
      unit: '',
      taxRate: 0,
      categoryId: null,
      branchId: null
    });

  }

}