import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class AdminDashboardComponent {
  isAdmin: boolean = false;
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 0;
  searchTerm: string = "";
  selectedRole: string = "";
  userToEdit: UserData | null = null;
  visible: boolean = false;

  roles = [
    { name: "Todos", code: "all" },
    { name: "Administradores", code: "admin" },
    { name: "Usuarios", code: "user" },
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.isAdmin = this.authService.getRole() === "admin";
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.id % 2 === 0 ? "admin" : "user",
      }));
      this.filteredUsers = this.users;
      this.totalRecords = this.users.length;
    });
  }

  onEdit(user: UserData) {
    this.userToEdit = { ...user };
    this.visible = true;
  }

  confirmDelete(user: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar a ${user.name}?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.onDelete(user);
      },
    });
  }

  onDelete(user: UserData) {
    this.userService.deleteUser(user.id).subscribe(() => {
      this.users = this.users.filter((u) => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
      this.totalRecords = this.filteredUsers.length;
      this.messageService.add({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario eliminado correctamente.",
      });
    })
  }

  confirmAction(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: message,
        header: "Confirmación",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }

  async saveUser() {
    if (this.userToEdit) {
      const confirmed = await this.confirmAction(
        `¿Estás seguro de que deseas guardar los cambios para ${this.userToEdit.name}?`
      );
      if (confirmed) {
        this.userService.editUser(this.userToEdit);
        const index = this.users.findIndex(
          (user) => user.id === this.userToEdit!.id
        );
        if (index !== -1) {
          this.users[index] = this.userToEdit;
          this.filteredUsers = [...this.users];
          this.userToEdit = null;
          this.totalRecords = this.filteredUsers.length;

          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Usuario actualizado correctamente.",
          });
        }
      }
    }
  }

  onSearchChange() {
    const searchResults = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.filteredUsers = this.applyRoleFilters(searchResults);
    this.totalRecords = this.filteredUsers.length;
  }

  applyRoleFilters(users: UserData[]): UserData[] {
    if (this.selectedRole === "all" || this.selectedRole === "") {
      return users;
    } else {
      return this.users.filter((user) => user.role === this.selectedRole);
    }
  }

  applyRoleFilter(users: UserData[]): UserData[] {
    if (this.selectedRole === "all" || this.selectedRole === "") {
      return this.users;
    } else {
      return this.users.filter((user) => user.role === this.selectedRole);
    }
  }

  onRoleChange() {
    this.filteredUsers = this.applyRoleFilter(this.filteredUsers);
    this.totalRecords = this.filteredUsers.length;
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
  }

  get paginatedUsers() {
    const start = this.currentPage * this.rowsPerPage;
    return this.filteredUsers.slice(start, start + this.rowsPerPage);
  }

  newUser: any = {
    name: '',
    email: '',
    role: ''
  };
  displayAddUserDialog: boolean = false;
  
  openAddUserDialog() {
    this.newUser = { name: '', email: '', role: '' };
    this.displayAddUserDialog = true;
  }

  addUser() {
    if (this.newUser.name && this.newUser.email && this.newUser.role) {
      this.userService.addUser(this.newUser).subscribe((user) => {
        this.users.push(user as UserData);

        this.messageService.add({
          severity: 'success',
          summary: 'Usuario Agregado',
          detail: `${user.name} ha sido agregado correctamente.`
        });

        this.displayAddUserDialog = false;
        this.newUser = { name: '', email: '', role: '' };
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, completa todos los campos.'
      });
    }
  }
}
