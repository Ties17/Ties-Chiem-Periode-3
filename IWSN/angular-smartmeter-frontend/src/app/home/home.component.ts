import { PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../apiservice.service';
import { SmartmeterData } from '../Models/SmartMeterData';
import {interval } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  pipe: any = new PercentPipe("en-US");

  dataSource: TempSmartmeterData[];
  smartmeterData : SmartmeterData | undefined;
  currentUsageDataSource: number = 0;

  constructor(apiService: ApiserviceService) {

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

    this.dataSource = [
      { day: "dag 1", kwh: 1800, cost: 3 },
      { day: "dag 2", kwh: 2000, cost: 4 },
      { day: "dag 3", kwh: 2100, cost: 4 },
      { day: "dag 4", kwh: 1700, cost: 3 },
      { day: "dag 5", kwh: 1500, cost: 2 },
      { day: "dag 6", kwh: 1800, cost: 5 },
      { day: "dag 7", kwh: 2100, cost: 3 }
    ];
  }

  customizeTooltipGraph = (info: any) => {
    return {
        html: "<div><div class='tooltip-header'>" +
            info.argumentText + "</div>" +
            "<div class='tooltip-body'><div class='series-name'>" +
            "<span class='top-series-name'>" + info.points[0].seriesName + "</span>" +": <span class='top-series-value'>" + info.points[0].valueText + "</span>" +
            "</div><div class='series-name'>" +
            "<span class='bottom-series-name'>" + info.points[1].seriesName + "</span>" +
            ": €" + "<span class='bottom-series-value'>" + info.points[1].valueText + "</span>" +
            " </div></div></div>"
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

class TempSmartmeterData {
  day: string | undefined;
  kwh: number | undefined;
  cost: number | undefined;
}
