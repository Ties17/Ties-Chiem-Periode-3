import { Injectable } from '@angular/core';
import { SmartMeterPowerData } from '../Models/SmartMeterPowerData';
import {SmartMeterDataGraph} from '../Models/SmartMeterGraphData'
import { timestamp } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GraphService {


  constructor() { }

  dataToGraph(smartmeterData : SmartMeterPowerData[]) : SmartMeterDataGraph[]  {
    let graphData : SmartMeterDataGraph[] = [];

    let timeGrouping : Date | undefined;
    let dataGroup : SmartMeterPowerData[] = [];
    //Loop through all data from last hour.
    smartmeterData.forEach(data => {

      //check time, same date - hour - minute goes together in small array
      let originalTime : Date = new Date();
      originalTime.setTime(data.Time * 1000); 

      if(timeGrouping == null) {
        timeGrouping = originalTime;
      }

      //check if the time from current iteration is same as the one from pervious iteration
      let sameTime : boolean = true;
      if(originalTime.getHours() == timeGrouping.getHours()) {
        if(originalTime.getMinutes() != timeGrouping.getMinutes()) {
          sameTime = false;
        }
      }
      else {
        sameTime = false;
      }

      if(sameTime) {
        dataGroup.push(data);
      }
      else {
        let totalPowerDeliverd : number = 0;

        dataGroup.forEach(minuteData => {
          if(minuteData.Actual_electricity_power_delivered_plus != null) {
            let powerDeliverd = this.powerDeliveredToNumber(minuteData.Actual_electricity_power_delivered_plus);
            powerDeliverd *= 1000; //convert to watt;
      
            totalPowerDeliverd += powerDeliverd;
          }
        });

        let originalTime : Date = new Date();
        originalTime.setTime(dataGroup[0].Time * 1000); 
        originalTime.setHours(originalTime.getHours() - 1); //adjust to timezone;
        let hours = originalTime.getHours().toString();
        if (originalTime.getHours() < 10) {
            hours = '0' + hours;
        }
        let minutes = originalTime.getMinutes().toString();
        if (originalTime.getMinutes() < 10) {
          minutes = '0' + minutes;
        }
  
        let graphDataSingle : SmartMeterDataGraph = new SmartMeterDataGraph();
        graphDataSingle.day = hours + ":" + minutes;
        graphDataSingle.watt = totalPowerDeliverd / dataGroup.length;
        
        graphData.push(graphDataSingle);

        dataGroup = [];
        timeGrouping = undefined;
      }
    });

    return graphData;
  }

  dataSourceToKWH(dataSource: SmartMeterDataGraph[]): number {
    let kwh : number = 0;

    dataSource.forEach(value => {
      if(value.watt != undefined)
        kwh += value.watt;
    });

    return (kwh / dataSource.length) / 1000;
  }

  powerDeliveredToNumber(powerDeleiverdAsString : string) : number {
    powerDeleiverdAsString = powerDeleiverdAsString.substring(0, powerDeleiverdAsString.length - 3);

    let powerDeliverd : number = +powerDeleiverdAsString;
    return powerDeliverd;
  }
}
