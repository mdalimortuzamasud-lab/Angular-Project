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
  finalize,
  forkJoin
} from 'rxjs';

import {
  UserService
} from '../../../../services/user.service';

import {
  RoleName,
  UserRequestModel,
  UserResponseModel,
  UserStatus
} from '../../../../model/user.model';

import {
  RoleService
} from '../../../../services/role.service';

import {
  BranchService
} from '../../../../services/branch-service';
import { RoleResponseModel } from '../../../../model/role.model';
import { AuthService } from '../../../../services/auth.service';


// =========================================================
// ROLE MODEL
// =========================================================

interface RoleModel {

  id: number;

  name: string;


}


// =========================================================
// BRANCH MODEL
// =========================================================

interface BranchModel {

  id: number;

  name: string;
}


@Component({
  selector: 'app-user',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './user-component.html',

  styleUrl: './user-component.css'
})
export class UserComponent implements OnInit {



  // =========================================================
  // INJECT SERVICES
  // =========================================================

  private readonly fb = inject(FormBuilder);

  private readonly userService = inject(UserService);

  private readonly roleService = inject(RoleService);

  private readonly branchService = inject(BranchService);

  private readonly authService = inject(AuthService);

  private readonly cdr = inject(ChangeDetectorRef);

  // ADMIN/MANAGER/STAFF/CASHIER only ever manage users in their own branch -
  // the server enforces this too, this just keeps the form honest.
  get isBranchLockedToSelf(): boolean {
    return !this.authService.isSuperAdmin();
  }

  get myBranchId(): number | null {
    return this.authService.currentUser?.branchId ?? null;
  }


  // =========================================================
  // DATA
  // =========================================================

  users: UserResponseModel[] = [];

  filteredUsers: UserResponseModel[] = [];

  roles: RoleResponseModel[] = [];

  branches: BranchModel[] = [];





  // =========================================================
  // UI STATE
  // =========================================================

  isLoading = false;

  isSaving = false;

  isEditMode = false;

  selectedUserId: number | null = null;

  searchText = '';


  // =========================================================
  // ENUM
  // =========================================================

  userStatuses = Object.values(UserStatus);


  // =========================================================
  // FORM
  // =========================================================

  userForm: FormGroup = this.fb.group({

    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    status: [
      UserStatus.ACTIVE,
      Validators.required
    ],

    roleId: [
      null,
      Validators.required
    ],

    branchId: [
      null
    ]

  });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadInitialData();

    this.watchRoleChange();
    this.loadRoles();
  }


  loadRoles() {

    this.roleService.getAllRoles().subscribe(
      {
        next: (data) => {

          // Only a SUPER_ADMIN can grant the SUPER_ADMIN role - the backend
          // rejects it anyway, but hiding it here avoids a confusing 403.
          this.roles = this.authService.isSuperAdmin()
            ? data
            : data.filter(role => role.name !== 'SUPER_ADMIN');

          this.cdr.markForCheck();

        },
        error: (er) => {
          console.log(er);
        }
      }
    );

  }


  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  loadInitialData(): void {

    this.isLoading = true;

    forkJoin({

      users: this.userService.getAllUsers(),

     


      branches: this.branchService.getAll()

    })
      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: (response) => {

          this.users = response.users;

          this.filteredUsers = response.users;         

          console.log(this.roles)

          // Non-super-admins can only ever place a user in their own
          // branch, so that's the only option they should see here.
          this.branches = this.isBranchLockedToSelf
            ? response.branches.filter(b => b.id === this.myBranchId)
            : response.branches;

          this.applyBranchLock();

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load user data',
            error
          );

        }

      });

  }


  // =========================================================
  // LOCK BRANCH FIELD TO THE LOGGED-IN USER'S OWN BRANCH
  // =========================================================

  private applyBranchLock(): void {

    const branchControl = this.userForm.get('branchId');

    if (this.isBranchLockedToSelf) {

      branchControl?.setValue(this.myBranchId);
      branchControl?.disable();

    } else {

      branchControl?.enable();

    }

  }


  // =========================================================
  // ROLE CHANGE
  // =========================================================

  watchRoleChange(): void {

    this.userForm
      .get('roleId')
      ?.valueChanges
      .subscribe((roleId: number) => {

        const selectedRole =
          this.roles.find(
            role => role.id === Number(roleId)
          );

        const branchControl =
          this.userForm.get('branchId');


        if (
          selectedRole?.name === 'SUPER_ADMIN'
        ) {

          branchControl?.clearValidators();

          branchControl?.setValue(null);

        } else {

          branchControl?.setValidators(
            Validators.required
          );

        }


        branchControl?.updateValueAndValidity();

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

      this.filteredUsers =
        this.users;

      return;

    }


    this.filteredUsers =
      this.users.filter(user =>

        user.username
          .toLowerCase()
          .includes(search)

        ||

        user.email
          .toLowerCase()
          .includes(search)

        ||

        user.roleName
          .toLowerCase()
          .includes(search)

        ||

        (user.branchName ?? '')
          .toLowerCase()
          .includes(search)

      );

  }


  // =========================================================
  // CREATE USER
  // =========================================================

  createUser(): void {

    this.isEditMode = false;

    this.selectedUserId = null;

    this.userForm.reset({

      username: '',

      email: '',

      password: '',

      status: UserStatus.ACTIVE,

      roleId: null,

      branchId: null

    });


    this.userForm
      .get('password')
      ?.setValidators([

        Validators.required,

        Validators.minLength(6)

      ]);


    this.userForm
      .get('password')
      ?.updateValueAndValidity();

    this.applyBranchLock();

  }


  // =========================================================
  // EDIT USER
  // =========================================================

  editUser(
    user: UserResponseModel
  ): void {

    this.isEditMode = true;

    this.selectedUserId = user.id;


    this.userForm.patchValue({

      username: user.username,

      email: user.email,

      password: '',

      status: user.status,

      roleId: user.roleId,

      branchId: user.branchId ?? null

    });

    this.applyBranchLock();


    this.userForm
      .get('password')
      ?.clearValidators();


    this.userForm
      .get('password')
      ?.updateValueAndValidity();

  }


  // =========================================================
  // SAVE USER
  // =========================================================

  saveUser(): void {

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      return;

    }


    // getRawValue(), not .value: branchId is disabled (locked) for
    // non-super-admins, and disabled controls are omitted from .value.
    const formValue =
      this.userForm.getRawValue();


    const userRequest: UserRequestModel = {

      username: formValue.username,

      email: formValue.email,

      password: formValue.password,

      status: formValue.status,

      roleId: Number(formValue.roleId),

      branchId:
        formValue.branchId
          ? Number(formValue.branchId)
          : undefined

    };


    this.isSaving = true;


    if (this.isEditMode && this.selectedUserId) {

      this.userService
        .updateUser(
          this.selectedUserId,
          userRequest
        )
        .pipe(

          finalize(() => {

            this.isSaving = false;

          })

        )
        .subscribe({

          next: () => {

            this.loadInitialData();

            this.resetForm();

          },

          error: (error) => {

            console.error(
              'Failed to update user',
              error
            );

          }

        });

    } else {

      this.userService
        .createUser(userRequest)
        .pipe(

          finalize(() => {

            this.isSaving = false;

          })

        )
        .subscribe({

          next: () => {

            this.loadInitialData();

            this.resetForm();

          },

          error: (error) => {

            console.error(
              'Failed to create user',
              error
            );

          }

        });

    }

  }


  // =========================================================
  // DELETE USER
  // =========================================================

  deleteUser(
    id: number
  ): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this user?'
      );


    if (!confirmed) {

      return;

    }


    this.userService
      .deleteUser(id)
      .subscribe({

        next: () => {

          this.loadInitialData();

        },

        error: (error) => {

          console.error(
            'Failed to delete user',
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

    this.selectedUserId = null;


    this.userForm.reset({

      username: '',

      email: '',

      password: '',

      status: UserStatus.ACTIVE,

      roleId: null,

      branchId: null

    });


    this.userForm
      .get('password')
      ?.setValidators([

        Validators.required,

        Validators.minLength(6)

      ]);


    this.userForm
      .get('password')
      ?.updateValueAndValidity();

    this.applyBranchLock();

  }


  // =========================================================
  // GET ROLE NAME
  // =========================================================

  getRoleName(
    roleId: number
  ): string {

    return this.roles.find(
      role => role.id === roleId
    )?.name ?? '';

  }


  // =========================================================
  // GET BRANCH NAME
  // =========================================================

  getBranchName(
    branchId?: number
  ): string {

    if (!branchId) {

      return 'All Branches';

    }


    return this.branches.find(
      branch => branch.id === branchId
    )?.name ?? '';

  }


  // =========================================================
  // FORM VALIDATION
  // =========================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.userForm.get(controlName);


    return !!(

      control &&

      control.invalid &&

      (

        control.touched ||

        control.dirty

      )

    );

  }
  // =========================================================
  // CHECK SUPER ADMIN
  // =========================================================

  isSuperAdmin(): boolean {

    const roleId = this.userForm.get('roleId')?.value;

    if (!roleId) {
      return false;
    }

    const selectedRole = this.roles.find(
      role => role.id === Number(roleId)
    );

    return selectedRole?.name === 'SUPER_ADMIN';

  }

}