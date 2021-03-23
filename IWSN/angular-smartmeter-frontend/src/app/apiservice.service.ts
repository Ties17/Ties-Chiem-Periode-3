import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartmeterData } from './Models/SmartMeterData';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {

  private readonly apiUrl : string = "http://192.168.0.129:3000";

  constructor(private http: HttpClient) { }

  getSmartMeterData(): Observable<SmartmeterData> {
    return this.http.get<SmartmeterData>(this.apiUrl, {
      responseType: 'json'
    });
  }

  getLastSmartMeterRecord(): Observable<SmartmeterData> {
    return this.http.get<SmartmeterData>(this.apiUrl + "/smartmeter/getLast")
  }
}
