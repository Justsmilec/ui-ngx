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

import { Component, Inject, OnDestroy, SkipSelf, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { DialogComponent } from '@shared/components/dialog.component';
import { Router } from '@angular/router';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { AddEntityDialogData } from '@home/models/entity/entity-component.models';
import { BaseData, HasId } from '@shared/models/base-data';
import { EntityType } from '@shared/models/entity-type.models';
import { EntityId } from '@shared/models/id/entity-id';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MediaBreakpoints } from '@shared/models/constants';
import { deepTrim } from '@core/utils';
import { TestingService } from '@app/core/http/testing.service';

@Component({
  selector: 'tb-testing-wizard',
  templateUrl: './testing-wizard-dialog.component.html',
  providers: [],
  styleUrls: ['./testing-wizard-dialog.component.scss']
})
export class TestingWizardDialogComponent extends
  DialogComponent<TestingWizardDialogComponent, boolean> implements OnDestroy, ErrorStateMatcher {

  @ViewChild('addTestingWizardStepper', {static: true}) addTestingWizardStepper: MatHorizontalStepper;

  selectedIndex = 0;
  showNext = true;

  createProfile = false;
  entityType = EntityType;
  testingWizardFormGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  labelPosition = 'end';

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: AddEntityDialogData<BaseData<EntityId>>,
              @SkipSelf() private errorStateMatcher: ErrorStateMatcher,
              public dialogRef: MatDialogRef<TestingWizardDialogComponent, boolean>,
              private testingService: TestingService,
              private breakpointObserver: BreakpointObserver,
              private fb: FormBuilder) {
    super(store, router, dialogRef);
    this.testingWizardFormGroup = this.fb.group({
        name: ['', Validators.required],
        sensorType: ['', Validators.required],
        model: ['', Validators.required],
        protocol: ['', Validators.required],
        
        description: ['']
      }
    );

    // this.subscriptions.push(this.testingWizardFormGroup.get('addProfileType').valueChanges.subscribe(
    //   (addProfileType: number) => {
    //     if (addProfileType === 0) {
    //       //this.testingWizardFormGroup.get('deviceProfileId').setValidators([Validators.required]);
    //       //this.testingWizardFormGroup.get('deviceProfileId').enable();
    //       this.testingWizardFormGroup.updateValueAndValidity();
    //       this.createProfile = false;
    //     } else {
    //       //this.testingWizardFormGroup.get('deviceProfileId').setValidators(null);
    //       //this.testingWizardFormGroup.get('deviceProfileId').disable();

    //       this.testingWizardFormGroup.updateValueAndValidity();
    //       this.createProfile = true;
    //     }
    //   }
    // ));


    this.labelPosition = this.breakpointObserver.isMatched(MediaBreakpoints['gt-sm']) ? 'end' : 'bottom';

    this.subscriptions.push(this.breakpointObserver
      .observe(MediaBreakpoints['gt-sm'])
      .subscribe((state: BreakpointState) => {
          if (state.matches) {
            this.labelPosition = 'end';
          } else {
            this.labelPosition = 'bottom';
          }
        }
      ));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this.errorStateMatcher.isErrorState(control, form);
    const customErrorState = !!(control && control.invalid);
    return originalErrorState || customErrorState;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  previousStep(): void {
    this.addTestingWizardStepper.previous();
  }

  nextStep(): void {
    this.addTestingWizardStepper.next();
  }

  getFormLabel(index: number): string {
    if (index > 0) {
      if (!this.createProfile) {
        index += 3;
      }
    }
    switch (index) {
      case 0:
        return 'device.wizard.device-details';
      case 1:
        return 'device-profile.transport-configuration';
      case 2:
        return 'device-profile.alarm-rules';
      case 3:
        return 'device-profile.device-provisioning';
      case 4:
        return 'device.credentials';
      case 5:
        return 'customer.customer';
    }
  }

  get maxStepperIndex(): number {
    return this.addTestingWizardStepper?._steps?.length - 1;
  }


  add(): void {
    console.log("Ktu u shtyp add");
    //if (this.allValid()) {
      // this.createDeviceProfile().pipe(
      // mergeMap(profileId => this.createDevice(profileId)),
      // ).subscribe(

      // );
      this.createDevice();
    //}

    // else{
    //   console.log("kto sjan valid e la");
    // }
  }


  private createDevice(): Observable<BaseData<HasId>> {
    console.log( this.testingWizardFormGroup.get('name').value + " ------------");
    const device = {
      name: this.testingWizardFormGroup.get('name').value,
      sensorType: this.testingWizardFormGroup.get('sensorType').value,
      model: this.testingWizardFormGroup.get('model').value,

      protocol: this.testingWizardFormGroup.get('protocol').value,

      additionalInfo: {
        description: this.testingWizardFormGroup.get('description').value
      },
      customerId: null
    };
    console.log("----:::  ", device)
    this.testingService.saveTesting(device).subscribe();
    return this.data.entitiesTableConfig.saveEntity(deepTrim(device));
  }


  allValid(): boolean {
    if (this.addTestingWizardStepper.steps.find((item, index) => {
      if (item.stepControl.invalid) {
        item.interacted = true;
        this.addTestingWizardStepper.selectedIndex = index;
        return true;
      } else {
        return false;
      }
    } )) {
      return false;
    } else {
      return true;
    }
  }

  changeStep($event: StepperSelectionEvent): void {
    this.selectedIndex = $event.selectedIndex;
    if (this.selectedIndex === this.maxStepperIndex) {
      this.showNext = false;
    } else {
      this.showNext = true;
    }
  }
}
