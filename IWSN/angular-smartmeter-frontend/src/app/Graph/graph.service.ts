import { Injectable } from '@angular/core';
import { SmartMeterPowerData } from '../Models/SmartMeterPowerData';
import {SmartMeterDataGraph} from '../Models/SmartMeterGraphData'

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  monthNames : string[] = ["Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
  ];

  constructor() { }

  dataToGraph(smartmeterData : SmartMeterPowerData[], dates : Date[], keyType : string) : SmartMeterDataGraph[]  {

    let graphData : SmartMeterDataGraph[] = [];
    let dataGroup : SmartMeterPowerData[] = [];
    let currentDate : number = 0;
    const energyCost : number = 0.22;

    //Loop through all data.
    smartmeterData.forEach(data => {

      let dataFragmentTime = new Date();
      dataFragmentTime.setTime(data.Time * 1000);
      dataFragmentTime.setHours(dataFragmentTime.getHours() - 1); //match with system time

      if(dates[currentDate] == null) {//return if there are no dates left
        return;
      }

      if(keyType == "seconds") {
        let key : string = this.generateGraphKey(dates, currentDate, keyType);
        let watt : number = 0;
        if(data.Actual_electricity_power_delivered_plus != null)
        {
          let powerDeliverd = this.powerDeliveredToNumber(data.Actual_electricity_power_delivered_plus);
          watt = (powerDeliverd * 1000); //to watt
        }
        
        let graphDataSingle : SmartMeterDataGraph = new SmartMeterDataGraph();
        graphDataSingle.day = key;
        graphDataSingle.watt = +watt.toFixed(0);
        graphData.push(graphDataSingle);
        currentDate++;
      }
      else if(dataFragmentTime.getTime() > dates[currentDate].getTime()) {

        let key : string = this.generateGraphKey(dates, currentDate, keyType);
        let watt : number = this.generateWatt(dataGroup);
        
        let graphDataSingle : SmartMeterDataGraph = new SmartMeterDataGraph();
        graphDataSingle.day = key;
        graphDataSingle.watt = +watt.toFixed(0);

        if(keyType == "days") { //wh to kwh
          graphDataSingle.watt = +(graphDataSingle.watt / 1000).toFixed(1);
          graphDataSingle.cost = +(graphDataSingle.watt * energyCost).toFixed(2);
        }
        
        graphData.push(graphDataSingle);
        dataGroup = [];
        currentDate++;
      }
      else {
        dataGroup.push(data);
      }
    });

    return graphData;
  }

  generateWatt(dataGroup: SmartMeterPowerData[]): number {
    
    let kwh : number = 0;
    let totalkWh : number = 0;
    let hoursInDataGroup : number = 0;
    let startHourDate : Date = new Date();
    let firstElement : SmartMeterPowerData | undefined;

    for(let i = 0; i < dataGroup.length; i++) {
      if(dataGroup[i] != null) {
        firstElement = dataGroup[i];
        break;
      }
    }

    if(firstElement != null) {
      startHourDate.setTime(firstElement.Time * 1000);
      startHourDate.setHours(startHourDate.getHours() + 1);
      startHourDate.setMinutes(startHourDate.getMinutes() + 1);
    }

    dataGroup.forEach(value => {
      if(value.Actual_electricity_power_delivered_plus != null)
      {
        if((value.Time * 1000) >= (startHourDate.getTime())) {

          totalkWh += kwh;
          hoursInDataGroup++;

          startHourDate.setTime(value.Time * 1000);
          startHourDate.setHours(startHourDate.getHours() + 1);

          kwh = 0;
        }

        let powerDeliverd = this.powerDeliveredToNumber(value.Actual_electricity_power_delivered_plus);
        kwh += (powerDeliverd * 1000); //to watt
      }
    });

    if(totalkWh <= 0) {
      return kwh / dataGroup.length;
    }

    return (totalkWh / (dataGroup.length / hoursInDataGroup));
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

  getDateForSecondsGraph(interval : number, amountOfSeconds : number) : Date[] {
    let dates : Date[] = [];
    let date : Date = new Date();
    date.setMinutes(date.getMinutes() - 1);

    for(let i = 0; i < amountOfSeconds; i++) {
      let dateToPush = new Date()
      dateToPush.setTime(date.getTime());
      dateToPush.setSeconds(date.getSeconds() + (interval * i));
      dates.push(dateToPush);
    }
  
    return dates;
  }

  getDatesForHourGraph(interval : number, amountOfHours : number): Date[] {
    let dates : Date[] = [];
    let date : Date = new Date();
    date.setHours(date.getHours() - amountOfHours);
    date.setMinutes((date.getMinutes() - (date.getMinutes() % interval)) + interval);
    date.setSeconds(0);

    let iterationTime = (amountOfHours * 60) / interval
    for(let i = 0; i < iterationTime; i++) {
      let dateToPush = new Date()
      dateToPush.setTime(date.getTime());
      dateToPush.setMinutes(date.getMinutes() + (interval * i));
      dates.push(dateToPush);
    }
  
    return dates;
  }

  getDatesForDaysGraph(interval : number, amountOfDays : number) : Date[] {
    
    let dates : Date[] = [];
    let date : Date = new Date();
    date.setDate(date.getDate()  - 1);

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    for(let i = 0; i < amountOfDays; i++) {
      let dateToPush = new Date();
      dateToPush.setTime(date.getTime());
      dateToPush.setDate(date.getDate() - i + interval);
      dates.push(dateToPush);
    }

    return dates.reverse();
  }

  generateGraphKey(dates: Date[], currentDate: number, keyType : string): string {

    if(keyType == "seconds") {
      let hours = dates[currentDate].getHours().toString();
      if (dates[currentDate].getHours() < 10) {
        hours = '0' + hours;
      }
      let minutes = dates[currentDate].getMinutes().toString();
      if (dates[currentDate].getMinutes() < 10) {
        minutes = '0' + minutes;
      }

      let seconds = dates[currentDate].getSeconds().toString();
      if (dates[currentDate].getSeconds() < 10) {
        seconds = '0' + seconds;
      }
      return hours + ":" + minutes + ":" + seconds;
    }

    if(keyType == "days") { //keys become days
      let dayNumber = dates[currentDate].getDate().toString();
      if (dates[currentDate].getDate() < 10) {
        dayNumber = '0' + dayNumber;
      }

      let monthNumber = dates[currentDate].getMonth();
      return dayNumber + "-" + this.monthNames[monthNumber];
    }
    else { //keys become hours
      let hours = dates[currentDate].getHours().toString();
      if (dates[currentDate].getHours() < 10) {
        hours = '0' + hours;
      }
      let minutes = dates[currentDate].getMinutes().toString();
      if (dates[currentDate].getMinutes() < 10) {
        minutes = '0' + minutes;
      }

      return hours + ":" + minutes;
    }
  }
}
 



