import { Component, ViewChild } from '@angular/core';
import { Injectable } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { List } from './Menu/menu'
import { GraphType } from './Enums/graphTypes'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(HomeComponent) home : HomeComponent | undefined

  isDrawerOpen: boolean = true;
  navigation: List[] | any[];

  constructor() {
    this.navigation = [
      { id: 1, text: "Realtime verbruik"},
      { id: 2, text: "Verbruik per uur" },
      { id: 3, text: "Verbruik per dag" },
      { id: 4, text: "Verbruik per week"},
      { id: 5, text: "Verbruik per maand"},
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

  itemClick(e : any) {
    if(e.itemData.id == 1) {
      this.home?.loadNewDataSource(GraphType.Realtime);
    }
    else if(e.itemData.id == 2) {
      this.home?.loadNewDataSource(GraphType.Hour);
    }
    else if(e.itemData.id == 3) {
      this.home?.loadNewDataSource(GraphType.Day);
    }
    else if(e.itemData.id == 4) {
      this.home?.loadNewDataSource(GraphType.Week);
    }
    else if(e.itemData.id == 5) {
      this.home?.loadNewDataSource(GraphType.Month);
    }
  }
}


