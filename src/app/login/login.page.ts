import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopUpMessageService } from '../../services/alert.service';
import { User } from '../dtos/IUser';
import { AuthenticationService } from '../../services/authentication.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: Observable<firebase.User>;
  isLogged: any = false;

  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private popUpService: PopUpMessageService,
    private gplus: GooglePlus,
    private platform: Platform,
    private authFire: AngularFireAuth) {
    this.user = this.authFire.authState;
  }

  ngOnInit() {
  }

  async userLogin(formUser: User) {
    const user = await this.authentication.loginUser(formUser);

    if (user) {
      this.authentication.isLogged = true;
      this.router.navigateByUrl('/dashboard');
      return;
    }

    this.popUpService.presentAlert('Erro ao fazer login, verifique suas credenciais');
  }

  async userLoginGoogle() {
    if (this.platform.is('cordova')) {
      this.nativeGoogleLogin();
      return;
    }

    this.webGoogleLogin();
  }

  async nativeGoogleLogin(): Promise<firebase.auth.UserCredential> {
    try {
      const gPlusUser = await this.gplus.login({
        'webClientId': '791223145380-jd1g30vk9078un0rj41otjgivn5vkqjf.apps.googleusercontent.com',
        'offline': true,
        'scopes': 'profile email'
      });

      return await this.authFire.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(gPlusUser.idToken)
      );
    } catch (err) {
      this.popUpService.presentAlert('Ocorreu um erro ao fazer login, tente novamente');
    }
  }

  async webGoogleLogin(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.authFire.signInWithPopup(provider);
      this.router.navigateByUrl('/dashboard');

    } catch (err) {
      this.popUpService.presentAlert('Algo inesperado aconteceu, tente novamente !');
    }
  }

  signOut() {
    this.authFire.signOut();
    if (this.platform.is('cordova')) {
      this.gplus.logout();
      return;
    }
  }



}
