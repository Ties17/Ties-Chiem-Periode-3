import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { List } from './Menu/menu'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isDrawerOpen: boolean = true;
  navigation: List[] | any[];

  constructor() {
    this.navigation = [
      { id: 1, text: "Verbruik per uur", icon: "event" },
      { id: 2, text: "Verbruik per dag", icon: "event" },
      { id: 3, text: "Verbruik per week", icon: "event" },
      { id: 4, text: "Verbruik per maand", icon: "event" },
    ];
  }

  toolbarContent = [{
    widget: 'dxButton',
    location: 'before',
    options: {
        icon: 'menu',
        onClick: () => this.isDrawerOpen = !this.isDrawerOpen
    }
}];

  title = 'angular-smartmeter-frontend';
}

