import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxButtonModule, DxCheckBoxModule, DxCircularGaugeModule, DxDrawerModule, DxListModule, DxMenuModule, DxNumberBoxModule, DxPieChartModule, DxRangeSelectorModule, DxSelectBoxModule, DxSliderModule, DxTextBoxModule, DxToolbarModule, DxTreeViewModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { DxoBehaviorModule } from 'devextreme-angular/ui/nested';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxChartModule,
    DxPieChartModule,
    DxCircularGaugeModule,
    HttpClientModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxToolbarModule,
    DxDrawerModule,
    DxMenuModule,
    DxListModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxTreeViewModule,
    DxSliderModule,
    DxoBehaviorModule,
    DxRangeSelectorModule,
    DxButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
