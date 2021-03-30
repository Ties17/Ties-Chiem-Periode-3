import { PercentPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from '../Api/apiservice.service';
import { SmartmeterData } from '../Models/SmartMeterData';
import {interval, Observable, Subject } from 'rxjs'
import { SmartMeterDataGraph } from '../Models/SmartMeterGraphData';
import { GraphService } from '../Graph/graph.service';
import { GraphType } from '../Enums/graphTypes'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  dataSource: SmartMeterDataGraph[] = [];
  smartmeterData : SmartmeterData | undefined;
  currentUsageDataSource: number = 0;
  kwValue : number = 0;
  valueFieldSeries : string = "watt";
  tickInterval : number = 0;
  costVisible : boolean = false;
  isRealtime : boolean = false;

  realTimeExists : boolean = false;
  graphType : string = "bar";
  isSliderVisible : boolean = false;

  Users = ["Ties", "Chiem"]
  selectedUser!: String;

  currentTemp: number = 0;
  currentHum: number = 0;
  readingTime: Date = new Date();
  observableTime: Subject<string> = new Subject<string>();

  sliderAmountOfHours : number = 1;


  constructor(private apiService: ApiserviceService, private graphService : GraphService) {
    interval(10000).subscribe(intervalValue => {
      apiService.getLastSmartMeterRecord().subscribe(value => {
        this.smartmeterData = (value[0]);
        let currentUsageString : string = this.smartmeterData.Actual_electricity_power_delivered_plus;
        currentUsageString = currentUsageString.substring(0, currentUsageString.length - 3);

        this.currentUsageDataSource = +currentUsageString;
        this.currentUsageDataSource *= 1000;
      });

      this.requestSensorData();
    });

    apiService.getPowerDataLastHour().subscribe(value => {
      this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(5, 1), "hours");
      this.kwValue = graphService.dataSourceToKWH(this.dataSource);
    });
  }

  ngOnInit(): void {}

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

    if(info.points[1] != null) { //kosten
      return {
        html: "<div><div class='tooltip-header'>" +
              info.argumentText + "</div>" +
              "<div class='tooltip-body'><div class='series-name'>" +
              "<span class='top-series-name'>" + info.points[0].seriesName + ": " + info.points[0].valueText  + "</span>" +
              "</div><div class='series-name'>" +
              "<span class='bottom-series-name'>" + info.points[1].seriesName + ": €" + info.points[1].valueText + "</span>" +
              "</div></div></div>"
      };
    }
    else {
      return {
        html: "<div><div class='tooltip-header'>" +
              info.argumentText + "</div>" +
              "<div class='tooltip-body'><div class='series-name'>" +
              "<span class='top-series-name'>" + info.points[0].seriesName + ": " + info.points[0].valueText  + "</span>" +
              "</div></div></div>"
      };
    }
  }

  customizeTooltipGauge(arg: any) {
    return {
        text: arg.value + " watt"
    };
  }

  loadNewDataSource(graphType : GraphType) {

    switch(graphType) {

      case GraphType.Realtime:
        
        if(!this.realTimeExists) {
          interval(10000).subscribe(intervalValue => { 
            if(this.isRealtime) {
              this.apiService.getPowerDataLastMinute().subscribe(value => {
                this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDateForSecondsGraph(10, 6), "seconds");
                this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
              });
            }
          });
        }

        this.apiService.getPowerDataLastMinute().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDateForSecondsGraph(10, 6), "seconds");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });
        
        this.costVisible = false;
        this.valueFieldSeries = "watt";
        this.tickInterval = 10;
        this.isRealtime = true;
        this.realTimeExists = true;
        this.graphType = "spline";
        this.isSliderVisible = false;

        break;
      case GraphType.Hour:

        this.apiService.getPowerDataLastHour().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(5, 1), "hours");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });
        this.valueFieldSeries = "watt";
        this.tickInterval = 1000;
        this.costVisible = false;
        this.graphType = "bar";
        this.isRealtime = false;
        this.isSliderVisible = false;

        break;
      case GraphType.Day:
        this.apiService.getPowerDataDay().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(60, 24), "hours");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });
        this.valueFieldSeries = "watt";
        this.tickInterval = 1000;
        this.costVisible = false;
        this.graphType = "bar";
        this.isRealtime = false;
        this.isSliderVisible = true;

        break;
      case GraphType.Week:
        this.apiService.getPowerDataWeek().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForDaysGraph(1, 7), "days");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });
        this.valueFieldSeries = "KwH";
        this.tickInterval = 5;
        this.costVisible = true;
        this.graphType = "bar";
        this.isRealtime = false;
        this.isSliderVisible = false;

        break;
      case GraphType.Month:
        this.apiService.getPowerDataMonth().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForDaysGraph(1, 30), "days");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });
        this.valueFieldSeries = "KwH";
        this.tickInterval = 5;
        this.costVisible = true;
        this.graphType = "bar";
        this.isRealtime = false;
        this.isSliderVisible = false;

        break;
    }
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

  onSliderValueChanged(event : any) {
    this.sliderAmountOfHours = event.value;
  }

  onSliderButtonClick(event : any) {
    this.apiService.getPowerDataCustom(this.sliderAmountOfHours).subscribe(value => {
      this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(60, this.sliderAmountOfHours), "hours");
      this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
    });
    this.valueFieldSeries = "watt";
    this.tickInterval = 1000;
    this.costVisible = false;
    this.graphType = "bar";
    this.isRealtime = false;
    this.isSliderVisible = true;
  }
}
