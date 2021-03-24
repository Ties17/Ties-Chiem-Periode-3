import { PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../Api/apiservice.service';
import { SmartmeterData } from '../Models/SmartMeterData';
import {interval } from 'rxjs'
import { SmartMeterDataGraph } from '../Models/SmartMeterGraphData';
import { GraphService } from '../Graph/graph.service';

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

  constructor(apiService: ApiserviceService, graphService : GraphService) {

    interval(10000).subscribe(intervalValue => {
      apiService.getLastSmartMeterRecord().subscribe(value => {
        this.smartmeterData = (value[0]);
        let currentUsageString : string = this.smartmeterData.Actual_electricity_power_delivered_plus;
        currentUsageString = currentUsageString.substring(0, currentUsageString.length - 3);

        this.currentUsageDataSource = +currentUsageString;
        this.currentUsageDataSource *= 1000;
        console.log(this.currentUsageDataSource);
      });
    });

    apiService.getPowerDataLastHour().subscribe(value => {
      this.dataSource = graphService.dataToGraph(value);
      this.kwValue = graphService.dataSourceToKWH(this.dataSource);
    });
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

  customizeTooltipDonut = (arg: any) => {
    return {
        text: arg.valueText + " - " + this.pipe.transform(arg.percent, "1.2-2")
    };
  }

  ngOnInit(): void {
  }

}
