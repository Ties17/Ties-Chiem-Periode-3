import { PercentPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from '../Api/apiservice.service';
import { SmartmeterData } from '../Models/SmartMeterData';
import {interval, Observable, Subject } from 'rxjs'
import { SmartMeterDataGraph } from '../Models/SmartMeterGraphData';
import { GraphService } from '../Graph/graph.service';
import { DxCircularGaugeComponent, DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  pipe: any = new PercentPipe("en-US");

  dataSource: SmartMeterDataGraph[] = [];
  smartmeterData : SmartmeterData | undefined;
  currentUsageDataSource: number = 0;
  kwValue : number = 0;

  Users = ["Ties", "Chiem"]
  selectedUser!: String;

  currentTemp: number = 0;
  currentHum: number = 0;
  readingTime: Date = new Date();
  observableTime: Subject<string> = new Subject<string>();


  constructor(private apiService: ApiserviceService, graphService : GraphService) {
    interval(10000).subscribe(intervalValue => {
      apiService.getLastSmartMeterRecord().subscribe(value => {
        this.smartmeterData = (value[0]);
        let currentUsageString : string = this.smartmeterData.Actual_electricity_power_delivered_plus;
        currentUsageString = currentUsageString.substring(0, currentUsageString.length - 3);

        this.currentUsageDataSource = +currentUsageString;
        this.currentUsageDataSource *= 1000;
        console.log(this.currentUsageDataSource);
        
      });

      this.requestSensorData();
    });

    apiService.getPowerDataLastHour().subscribe(value => {
      this.dataSource = graphService.dataToGraph(value, 1);
      this.kwValue = graphService.dataSourceToKWH(this.dataSource);
    });
  }

  requestSensorData(): void {
    switch (this.selectedUser) {
      case "Ties":
        this.apiService.getLastSensorReadingTies().subscribe(value => {
          this.readSensorData(value);
        })
        break;
      case "Chiem":
        this.apiService.getLastSensorReadingChiem().subscribe(value => {
          this.readSensorData(value);
        })
        break;
    }
  }

  readSensorData(value: any): void {
    let SensorData = value[0];
    this.currentTemp = SensorData.temperature;
    this.currentHum = SensorData.humidity;
    this.readingTime.setTime(SensorData.Time * 1000);
    this.readingTime.setHours(this.readingTime.getHours() - 1);
    this.observableTime.next(this.readingTime.toString());
  }

  customizeTooltipGraph = (info: any) => {
    return {
        html: "<div><div class='tooltip-header'>" +
            info.argumentText + "</div>" +
            "<div class='tooltip-body'><div class='series-name'>" +
            "<span class='top-series-name'>" + info.points[0].seriesName + "</span>" +": <span class='top-series-value'>" + info.points[0].valueText + "</span>" +
            "</div></div></div>"
    };

  }

  customizeTooltipGauge(arg: any) {
    return {
        text: arg.value + " watt"
    };
  }

  customizeTooltipTemp(arg: any) {
    return {
      text: arg.value + " Graden"
    };
  }

  customizeTooltipHum(arg: any) {
    return {
      text: arg.value + " %"
    };
  }
  
  userSelected(event: any): void {
    this.selectedUser=event.value;
    this.requestSensorData();
  }

  ngOnInit(): void {
  }
}
