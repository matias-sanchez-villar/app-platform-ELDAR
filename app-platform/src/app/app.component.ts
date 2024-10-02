import { Component } from "@angular/core";
import { PrimeNGConfig } from "primeng/api";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  constructor(private primengConfig: PrimeNGConfig, private authService: AuthService) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }

  goToExternalLink() {
    window.open('https://eldars.com.ar/', '_blank');
  }
}
