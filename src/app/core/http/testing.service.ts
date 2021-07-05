///
/// Copyright © 2016-2021 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Injectable } from '@angular/core';
import { defaultHttpOptionsFromConfig, RequestConfig } from './http-utils';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PageLink } from '@shared/models/page/page-link';
import { PageData } from '@shared/models/page/page-data';
import {
  ClaimRequest,
  ClaimResult,
  Testing,
  TestingCredentials,
  TestingInfo,
  DeviceSearchQuery
} from '@app/shared/models/testing.models';
import { EntitySubtype } from '@app/shared/models/entity-type.models';
import { AuthService } from '@core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TestingService {

  constructor(
    private http: HttpClient
  ) { }

  public getTenantDeviceInfos(pageLink: PageLink, type: string = '',
                              config?: RequestConfig): Observable<PageData<TestingInfo>> {
    return this.http.get<PageData<TestingInfo>>(`/api/tenant/deviceInfos${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getTenantDeviceInfos_(pageLink: PageLink,
  config?: RequestConfig): Observable<PageData<TestingInfo>> {
return this.http.get<PageData<TestingInfo>>(`/api/tenant/deviceInfos${pageLink.toQuery()}`,
defaultHttpOptionsFromConfig(config));
}
  public getTenantDeviceInfosByDeviceProfileId(pageLink: PageLink, deviceProfileId: string = '',
                                               config?: RequestConfig): Observable<PageData<TestingInfo>> {
    return this.http.get<PageData<TestingInfo>>(`/api/tenant/deviceInfos${pageLink.toQuery()}&deviceProfileId=${deviceProfileId}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getCustomerDeviceInfos(customerId: string, pageLink: PageLink, type: string = '',
                                config?: RequestConfig): Observable<PageData<TestingInfo>> {
    return this.http.get<PageData<TestingInfo>>(`/api/customer/${customerId}/deviceInfos${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getCustomerDeviceInfosByDeviceProfileId(customerId: string, pageLink: PageLink, deviceProfileId: string = '',
                                                 config?: RequestConfig): Observable<PageData<TestingInfo>> {
    return this.http.get<PageData<TestingInfo>>(`/api/customer/${customerId}/deviceInfos${pageLink.toQuery()}&deviceProfileId=${deviceProfileId}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getDevice(deviceId: string, config?: RequestConfig): Observable<Testing> {
    return this.http.get<Testing>(`/api/device/${deviceId}`, defaultHttpOptionsFromConfig(config));
  }

  public getDevices(deviceIds: Array<string>, config?: RequestConfig): Observable<Array<Testing>> {
    return this.http.get<Array<Testing>>(`/api/devices?deviceIds=${deviceIds.join(',')}`, defaultHttpOptionsFromConfig(config));
  }

  public getDeviceInfo(deviceId: string, config?: RequestConfig): Observable<TestingInfo> {
    return this.http.get<TestingInfo>(`/api/device/info/${deviceId}`, defaultHttpOptionsFromConfig(config));
  }

  public saveTesting(device: Testing, config?: RequestConfig): Observable<Testing> {
    console.log("ore a futet ktu a jo? ");
    return this.http.post<Testing>('/api/testing', device, defaultHttpOptionsFromConfig(config));
  }
  public saveTesting1() : Observable<any> {
    console.log("ore a futet ktu a jo? ");
    return this.http.get<any>('/api/testing1');
  }
  public deleteDevice(deviceId: string, config?: RequestConfig) {
    return this.http.delete(`/api/device/${deviceId}`, defaultHttpOptionsFromConfig(config));
  }

  public getDeviceTypes(config?: RequestConfig): Observable<Array<EntitySubtype>> {
    return this.http.get<Array<EntitySubtype>>('/api/device/types', defaultHttpOptionsFromConfig(config));
  }

  public getDeviceCredentials(deviceId: string, sync: boolean = false, config?: RequestConfig): Observable<TestingCredentials> {
    const url = `/api/device/${deviceId}/credentials`;
    if (sync) {
      const responseSubject = new ReplaySubject<TestingCredentials>();
      const request = new XMLHttpRequest();
      request.open('GET', url, false);
      request.setRequestHeader('Accept', 'application/json, text/plain, */*');
      const jwtToken = AuthService.getJwtToken();
      if (jwtToken) {
        request.setRequestHeader('X-Authorization', 'Bearer ' + jwtToken);
      }
      request.send(null);
      if (request.status === 200) {
        const credentials = JSON.parse(request.responseText) as TestingCredentials;
        responseSubject.next(credentials);
      } else {
        responseSubject.error(null);
      }
      return responseSubject.asObservable();
    } else {
      return this.http.get<TestingCredentials>(url, defaultHttpOptionsFromConfig(config));
    }
  }

  public saveDeviceCredentials(deviceCredentials: TestingCredentials, config?: RequestConfig): Observable<TestingCredentials> {
    return this.http.post<TestingCredentials>('/api/device/credentials', deviceCredentials, defaultHttpOptionsFromConfig(config));
  }



  
  public findByQuery(query: DeviceSearchQuery,
                     config?: RequestConfig): Observable<Array<Testing>> {
    return this.http.post<Array<Testing>>('/api/devices', query, defaultHttpOptionsFromConfig(config));
  }

  public findByName(deviceName: string, config?: RequestConfig): Observable<Testing> {
    return this.http.get<Testing>(`/api/tenant/devices?deviceName=${deviceName}`, defaultHttpOptionsFromConfig(config));
  }

  public claimDevice(deviceName: string, claimRequest: ClaimRequest,
                     config?: RequestConfig): Observable<ClaimResult> {
    return this.http.post<ClaimResult>(`/api/customer/device/${deviceName}/claim`, claimRequest, defaultHttpOptionsFromConfig(config));
  }

  public unclaimDevice(deviceName: string, config?: RequestConfig) {
    return this.http.delete(`/api/customer/device/${deviceName}/claim`, defaultHttpOptionsFromConfig(config));
  }

}
