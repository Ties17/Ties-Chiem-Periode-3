import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartmeterData } from '../Models/SmartMeterData';
import { HttpClient } from '@angular/common/http';
import {repeatWhen, retry} from 'rxjs/operators';
import { SmartMeterPowerData } from '../Models/SmartMeterPowerData';
import { SensorData } from '../Models/SensorData';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  

  private readonly apiUrl : string = "http://localhost:3000";

  constructor(private http: HttpClient) { }

  getSmartMeterData(): Observable<SmartmeterData[]> {
    return this.http.get<SmartmeterData[]>(this.apiUrl, {
      responseType: 'json'
    });
  }

  getPowerData(): Observable<SmartMeterPowerData[]> {
    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/allData");
  }

  getPowerDataCustom(hours : number) : Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    dateNow.setHours(dateNow.getHours() + 1);
    dateNow.setHours(dateNow.getHours() - hours);
    const epochNow = Math.floor((dateNow.getTime() / 1000));
    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getPowerDataLastMinute() : Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    dateNow.setHours(dateNow.getHours() + 1);
    dateNow.setMinutes(dateNow.getMinutes() - 1);
    const epochNow = Math.floor((dateNow.getTime() / 1000));

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getPowerDataLastHour(): Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    const epochNow = Math.floor((dateNow.getTime() / 1000));

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getPowerDataDay() : Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    dateNow.setDate(dateNow.getDate() - 1);
    const epochNow = Math.floor((dateNow.getTime() / 1000));

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getPowerDataWeek() : Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    dateNow.setDate(dateNow.getDate() - 7);
    const epochNow = Math.floor((dateNow.getTime() / 1000));

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getPowerDataMonth() : Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();
    dateNow.setMonth(dateNow.getMonth() - 1);
    const epochNow = Math.floor((dateNow.getTime() / 1000));

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getLastSmartMeterRecord(): Observable<SmartmeterData[]> {
    return this.http.get<SmartmeterData[]>(this.apiUrl + "/smartmeter/getLast");
  }

  getLastSensorReadingChiem(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(this.apiUrl + "/sensors/getLast/?MQTT_USER=SENSORDATA-CHIEM");
  }
  getLastSensorReadingTies(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(this.apiUrl + "/sensors/getLast/?MQTT_USER=SENSORDATA-Ties");
  }
}
