import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartmeterData } from '../Models/SmartMeterData';
import { HttpClient } from '@angular/common/http';
import {repeatWhen, retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {

  private readonly apiUrl : string = "http://localhost:3000";

  constructor(private http: HttpClient) { }

  getSmartMeterData(): Observable<SmartmeterData> {
    return this.http.get<SmartmeterData>(this.apiUrl, {
      responseType: 'json'
    });
  }

  getLastSmartMeterRecord(): Observable<SmartmeterData[]> {
    return this.http.get<SmartmeterData[]>(this.apiUrl + "/smartmeter/getLast");
  }
}