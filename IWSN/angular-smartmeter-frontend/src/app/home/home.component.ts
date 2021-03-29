import { PercentPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from '../Api/apiservice.service';
import { SmartmeterData } from '../Models/SmartMeterData';
import {interval } from 'rxjs'
import { SmartMeterDataGraph } from '../Models/SmartMeterGraphData';
import { GraphService } from '../Graph/graph.service';
import { DxCircularGaugeComponent, DxDataGridComponent } from 'devextreme-angular';
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

  constructor(public apiService: ApiserviceService, public graphService : GraphService) {
    interval(10000).subscribe(intervalValue => {
      apiService.getLastSmartMeterRecord().subscribe(value => {
        this.smartmeterData = (value[0]);
        let currentUsageString : string = this.smartmeterData.Actual_electricity_power_delivered_plus;
        currentUsageString = currentUsageString.substring(0, currentUsageString.length - 3);

        this.currentUsageDataSource = +currentUsageString;
        this.currentUsageDataSource *= 1000;
      });
    });

    apiService.getPowerDataLastHour().subscribe(value => {
      this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(5, 1), "hours");
      this.kwValue = graphService.dataSourceToKWH(this.dataSource);
    });
  }

  ngOnInit(): void {
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

  loadNewDataSource(graphType : GraphType) {

    switch(graphType) {
      case GraphType.Hour:

        this.apiService.getPowerDataLastHour().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(5, 1), "hours");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });

        break;
      case GraphType.Day:

        this.apiService.getPowerDataDay().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForHourGraph(60, 24), "hours");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });

        break;
      case GraphType.Week:
        
        this.apiService.getPowerDataWeek().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForDaysGraph(1, 7), "days");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });

        break;
      case GraphType.Month:
        
        this.apiService.getPowerDataMonth().subscribe(value => {
          this.dataSource = this.graphService.dataToGraph(value, this.graphService.getDatesForDaysGraph(1, 30), "days");
          this.kwValue = this.graphService.dataSourceToKWH(this.dataSource);
        });

        break;
    }
  }

}
