import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../../services/category.service';
import { CategoryRequestModel, CategoryResponseModel } from '../../../../model/category.model';

@Component({
  selector: 'app-category-component',
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './category-component.html',
  styleUrl: './category-component.css',
})
export class CategoryComponent {

 private service = inject(CategoryService);
 private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  categories: CategoryResponseModel[] = [];

  isEdit = false;
  editId = 0;

  form = this.fb.group({
    name: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.service.getAll().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.markForCheck();
      }
    });
  }

  save() {

    if (this.form.invalid) {
      return;
    }

    const data = this.form.value as CategoryRequestModel;

    if (this.isEdit) {

      this.service.update(this.editId, data).subscribe({
        
        next: () => {
          this.resetForm();
          this.loadCategories();
          console.log(data);
        }
      });

    } else {

      this.service.create(data).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
        }
      });

    }

  }

  edit(category: CategoryResponseModel) {

    this.isEdit = true;
    this.editId = category.id;

    console.log(this.editId);

    this.form.patchValue({
      name: category.name
    });

  }

  delete(id: number) {

    if (!confirm('Delete this category?')) {
      return;
    }

    this.service.delete(id).subscribe({
      next: () => {
        this.loadCategories();
      }
    });

  }

  resetForm() {

    this.form.reset();

    this.isEdit = false;
    this.editId = 0;

  }


}
