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

  private readonly apiUrl : string = "http://192.168.0.129:3000";

  constructor(private http: HttpClient) { }

  getSmartMeterData(): Observable<SmartmeterData[]> {
    return this.http.get<SmartmeterData[]>(this.apiUrl, {
      responseType: 'json'
    });
  }

  getPowerData(): Observable<SmartMeterPowerData[]> {
    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/allData");
  }

  getPowerDataLastHour(): Observable<SmartMeterPowerData[]> {
    let dateNow : Date = new Date();

    console.log(dateNow.getTime() / 1000);
    const epochNow = Math.floor((dateNow.getTime() / 1000));
    console.log(dateNow);

    return this.http.get<SmartMeterPowerData[]>(this.apiUrl + "/powerdata/dataByTime/?time=" + epochNow);
  }

  getLastSmartMeterRecord(): Observable<SmartmeterData[]> {
    return this.http.get<SmartmeterData[]>(this.apiUrl + "/smartmeter/getLast");
  }

  getLastSensorReadingChiem(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(this.apiUrl + "/sensors/getLast/?MQTT_USER=SENSORDATA-CHIEM");
  }
  getLastSensorReadingTies(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(this.apiUrl + "/sensors/getLast/?MQTT_USER=SENSORDATA-TIES");
  }
}
