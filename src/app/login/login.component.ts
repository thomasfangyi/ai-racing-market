import {Component, Input, OnInit} from "@angular/core";
import {AuthService} from "../auth.service";

interface Credential {
    username: string;
    password: string;
}

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [AuthService]
})
export class LoginComponent implements OnInit {

    credential: Credential = {
        username: "",
        password: ""
    };

    constructor(private auth: AuthService) {
    }

    ngOnInit(): void {

    }

    onLogin() {
        this.auth.login(this.credential, this.successCallback, this.failureCallback);
    }

    onRegister() {
        this.auth.register(this.credential, this.successCallback, this.failureCallback);
    }

    onLogout() {
        this.auth.logout();
    }

    successCallback(token) {
        alert("success!");
    }

    failureCallback(error) {
        const errorText = JSON.parse(error._body).error;
        alert(`failed! Reason: ${errorText}`);
    }
}
