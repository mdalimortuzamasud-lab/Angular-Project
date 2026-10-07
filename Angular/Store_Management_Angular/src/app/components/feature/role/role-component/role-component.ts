import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  finalize
} from 'rxjs';

import {
  RoleService
} from '../../../../services/role.service';

import {
  RoleRequestModel,
  RoleResponseModel,
  RoleName
} from '../../../../model/role.model';


@Component({

  selector: 'app-role',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    ReactiveFormsModule

  ],

  templateUrl: './role-component.html',

  styleUrl: './role-component.css'

})
export class RoleComponent implements OnInit {


  // =========================================================
  // INJECT SERVICES
  // =========================================================

  private readonly fb =
    inject(FormBuilder);


  private readonly roleService =
    inject(RoleService);


  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  roles: RoleResponseModel[] = [];

  filteredRoles: RoleResponseModel[] = [];


  // =========================================================
  // ROLE ENUM DROPDOWN
  // =========================================================

  roleNames: RoleName[] =
    Object.values(RoleName);


  // =========================================================
  // UI STATE
  // =========================================================

  isLoading = false;

  isSaving = false;

  isEditMode = false;

  selectedRoleId: number | null = null;

  searchText = '';


  // =========================================================
  // FORM
  // =========================================================

  roleForm: FormGroup =
    this.fb.group({

      name: [

        '',

        [

          Validators.required

        ]

      ]

    });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadRoles();

  }


  // =========================================================
  // LOAD ROLES
  // =========================================================

  loadRoles(): void {

    this.isLoading = true;


    this.roleService

      .getAllRoles()

      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (roles) => {

          this.roles = roles;

          this.filteredRoles = [...roles];

        },

        error: (error) => {

          console.error(

            'Failed to load roles',

            error

          );

        }

      });

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {

    const search =

      this.searchText

        .toLowerCase()

        .trim();


    if (!search) {

      this.filteredRoles =

        [...this.roles];

      return;

    }


    this.filteredRoles =

      this.roles.filter(role =>

        role.name

          .toLowerCase()

          .includes(search)

      );

  }


  // =========================================================
  // CREATE ROLE
  // =========================================================

  createRole(): void {

    this.isEditMode = false;

    this.selectedRoleId = null;


    this.roleForm.reset({

      name: ''

    });

  }


  // =========================================================
  // EDIT ROLE
  // =========================================================

  editRole(

    role: RoleResponseModel

  ): void {

    this.isEditMode = true;

    this.selectedRoleId = role.id;


    this.roleForm.patchValue({

      name: role.name

    });

  }


  // =========================================================
  // SAVE ROLE
  // =========================================================

  saveRole(): void {


    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;

    }


    const roleRequest:

      RoleRequestModel = {

        name:

          this.roleForm

            .get('name')

            ?.value

            ?.trim()

      };


    this.isSaving = true;


    if (

      this.isEditMode &&

      this.selectedRoleId !== null

    ) {


      this.roleService

        .updateRole(

          this.selectedRoleId,

          roleRequest

        )

        .pipe(

          finalize(() => {

            this.isSaving = false;

          })

        )

        .subscribe({

          next: () => {

            this.loadRoles();

            this.resetForm();

          },

          error: (error) => {

            console.error(

              'Failed to update role',

              error

            );

          }

        });


    } else {


      this.roleService

        .createRole(roleRequest)

        .pipe(

          finalize(() => {

            this.isSaving = false;

          })

        )

        .subscribe({

          next: () => {

            this.loadRoles();

            this.resetForm();

          },

          error: (error) => {

            console.error(

              'Failed to create role',

              error

            );

          }

        });

    }

  }


  // =========================================================
  // DELETE ROLE
  // =========================================================

  deleteRole(

    id: number

  ): void {


    const confirmed =

      window.confirm(

        'Are you sure you want to delete this role?'

      );


    if (!confirmed) {

      return;

    }


    this.roleService

      .deleteRole(id)

      .subscribe({

        next: () => {

          this.loadRoles();

        },

        error: (error) => {

          console.error(

            'Failed to delete role',

            error

          );

        }

      });

  }


  // =========================================================
  // RESET FORM
  // =========================================================

  resetForm(): void {

    this.isEditMode = false;

    this.selectedRoleId = null;


    this.roleForm.reset({

      name: ''

    });

  }


  // =========================================================
  // FORM VALIDATION
  // =========================================================

  isInvalid(

    controlName: string

  ): boolean {


    const control =

      this.roleForm

        .get(controlName);


    return !!(

      control &&

      control.invalid &&

      (

        control.touched ||

        control.dirty

      )

    );

  }

}