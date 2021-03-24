import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxCheckBoxModule, DxCircularGaugeModule, DxDrawerModule, DxListModule, DxMenuModule, DxNumberBoxModule, DxPieChartModule, DxSelectBoxModule, DxTextBoxModule, DxToolbarModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';

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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
