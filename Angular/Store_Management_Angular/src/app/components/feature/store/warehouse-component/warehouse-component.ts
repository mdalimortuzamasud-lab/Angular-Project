import { ChangeDetectorRef, Component } from '@angular/core';
import { WarehouseRequest, WarehouseResponse } from '../../../../model/warehouse.model';
import { WarehouseService } from '../../../../services/warehouse-service';
import { BranchService } from '../../../../services/branch-service';
import { BranchResponse } from '../../../../model/branch.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-warehouse-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-component.html',
  styleUrl: './warehouse-component.css',
})
export class WarehouseComponent {

  constructor(
    private warehouseService: WarehouseService,
    private branchService: BranchService,
    private cdr: ChangeDetectorRef
  ) { }

  warehouses: WarehouseResponse[] = [];
  branches: BranchResponse[] = [];

  warehouse: WarehouseRequest = {
    name: '',
    branchId: 0
  };

  selectedId: number | null = null;

  ngOnInit() {
    this.loadBranches();
    this.loadWarehouses();
  }

  loadBranches() {
    this.branchService.getAll().subscribe(
      {
        next: (res) => {
          this.branches = res,
            this.cdr.markForCheck();
        },
        error: (err) => {
          console.log(err);
        }

      }
    );
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        this.warehouses = res,
          this.cdr.markForCheck();
      }
    });
  }

  save() {

    if (!this.warehouse.name.trim()) {
      alert('Warehouse name is required');
      return;
    }

    if (this.warehouse.branchId === 0) {
      alert('Please select a branch');
      return;
    }

    const request = this.selectedId == null
      ? this.warehouseService.create(this.warehouse)
      : this.warehouseService.update(this.selectedId, this.warehouse);

    request.subscribe({
      next: () => {
        alert(
          this.selectedId == null
            ? 'Warehouse Added'
            : 'Warehouse Updated'
        );

        this.resetForm();
        this.loadWarehouses();
      },
      error: err => console.error(err)
    });
  }

  edit(item: WarehouseResponse) {

    this.selectedId = item.id;

    this.warehouse = {
      name: item.name,
      branchId: item.branchId
    };

  }

  delete(id: number) {

    if (!confirm('Delete this warehouse?')) {
      return;
    }

    this.warehouseService.delete(id).subscribe({
      next: () => {
        alert('Deleted Successfully');
        this.loadWarehouses();
        this.resetForm();
      }
    });

  }

  resetForm() {

    this.selectedId = null;

    this.warehouse = {
      name: '',
      branchId: 0
    };

  }


}
