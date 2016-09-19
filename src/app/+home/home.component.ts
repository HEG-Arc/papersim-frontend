import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SimService } from '../shared/index';


/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent {

  newName: string;

  /**
   * Creates an instance of the HomeComponent with the injected
   * NameListService.
   *
   * @param {NameListService} nameListService - The injected NameListService.
   */
  constructor(private router: Router, private simService: SimService) {
  }

  /**
   * Calls the add method of the NameListService with the current newName value of the form.
   * @return {boolean} false to prevent default form submit behavior to refresh the page.
   */
  createGame(): boolean {
    this.simService.createGame(this.newName).then((id) => {
      this.router.navigate(['/game', id]);
    });
    this.newName = '';
    return false;
  }

}
