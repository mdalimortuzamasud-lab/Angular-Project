import { ChangeDetectorRef, Component } from '@angular/core';
import { BranchRequest, BranchResponse } from '../../../../model/branch.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { BranchService } from '../../../../services/branch-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-branch-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-component.html',
  styleUrl: './branch-component.css',
})
export class BranchComponent {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private branchService: BranchService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) { }




  branches: BranchResponse[] = [];

  branch: BranchRequest = {
    name: '',
    location: ''
  };

  selectedId: number | null = null;

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAll().subscribe(
      {
        next: (data) => {
          this.branches = data,
            this.cdr.markForCheck();
        }
      }

    );
  }


  save() {

    if (!this.branch.name.trim() || !this.branch.location.trim()) {
      alert('Please fill all fields.');
      return;
    }

    const request = this.selectedId == null
      ? this.branchService.create(this.branch)
      : this.branchService.update(this.selectedId, this.branch);

    request.subscribe({
      next: () => {
        alert(this.selectedId ? 'Branch updated.' : 'Branch created.');
        this.resetForm();
        this.loadBranches();
      },
      error: err => console.error(err)
    });

  }

  edit(branch: BranchResponse) {

    this.selectedId = branch.id!;

    this.branch = {
      name: branch.name,
      location: branch.location
    };

  }

  delete(id: number) {

    if (confirm('Delete this branch?')) {

      this.branchService.delete(id).subscribe(() => {
        this.loadBranches();
      });

    }

  }




  resetForm() {

    this.selectedId = null;

    this.branch = {
      name: '',
      location: ''
    };

  }




}
