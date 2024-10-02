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
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html",
  styleUrls: ["./user-dashboard.component.scss"],
  providers: [ConfirmationService, MessageService],
})
export class UserDashboardComponent implements OnInit {
  isAdmin: boolean = false;
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 0;
  searchTerm: string = "";
  selectedRole: string = "";
  userToEdit: UserData | null = null; // Almacena el usuario que se está editando

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
}
