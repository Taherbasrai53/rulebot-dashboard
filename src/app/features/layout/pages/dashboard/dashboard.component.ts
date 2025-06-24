import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { HttpService } from '../../../../core/services/http.service';

import { NgChartsModule } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { ProcessItem } from '../../../../core/models/process-item.model';
import { MatIcon } from '@angular/material/icon';

import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  imports: [

    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule,
    NgChartsModule,
    MatIcon
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  processes: ProcessItem[] = [];
  pages: string[] = [];
  currentPageIndex = 0;
  complianceData: any[] = [];
  selectedProcess = new FormControl();
  selectedPages = new FormControl([]);
  @ViewChild('stageChart') stageChart?: BaseChartDirective;
  @ViewChild('dataItemChart') dataItemChart?: BaseChartDirective;

stageComplianceData = {
  labels: ['Compliant', 'Uncompliant'],
  datasets: [
    {
      data: [10, 20],
      backgroundColor: ['#4caf50', '#f44336'],
    },
  ],
};

dataItemComplianceData = {
  labels: ['Compliant', 'Uncompliant'],
  datasets: [
    {
      data: [15, 5],
      backgroundColor: ['#4caf50', '#f44336'],
    },
  ],
}
  chartLabels: string[] = ['Compliant', 'Non-Compliant'];

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.fetchProcesses();
  }

  compareById = (a: any, b: any): boolean => {
  return a && b ? a.processId === b.processId : a === b;
};

  fetchProcesses() {
    this.http.get<ProcessItem[]>('Process/get-process-names').subscribe({
          next: (data) => (this.processes = data),
          error: (err) => console.error('Failed to load process names', err)
        });
    
  }

  onProcessChange(process: ProcessItem) {
    this.http.get<string[]>(`Process/get-process-details?processId=${process.processId}`).subscribe({
      next: (data) => {
        this.pages = data;
      },
      error: (err) => {
        console.error('Failed to load pages for process', err);
      }
    });
  }


  get currentPageData() {
  return this.complianceData[this.currentPageIndex];
}

get hasPrev() {
  return this.currentPageIndex > 0;
}

get hasNext() {
  return this.currentPageIndex < this.complianceData.length - 1;
}

goToPrevPage() {
  if (this.hasPrev) {
    this.currentPageIndex--;
    this.updateChartData();
  }
}

goToNextPage() {
  if (this.hasNext) {
    this.currentPageIndex++;
    this.updateChartData();
  }
}

updateChartData() {
  const current = this.currentPageData;
  if (current) {
    // Replace entire datasets array to trigger change detection
    this.stageComplianceData = {
      labels: ['Compliant', 'Uncompliant'],
      datasets: [
        {
          data: [current.stageCompliantNum, current.stageUnCompliantNum],
          backgroundColor: ['#4caf50', '#f44336'],
        },
      ],
    };

    this.dataItemComplianceData = {
      labels: ['Compliant', 'Uncompliant'],
      datasets: [
        {
          data: [current.dataItemCompliantNum, current.dataItemUnCompliantNum],
          backgroundColor: ['#4caf50', '#f44336'],
        },
      ],
    };

    // Optional: also call update() in case it helps refresh (good practice)
    this.stageChart?.update();
    this.dataItemChart?.update();
  }
}



  fetchComplianceData() {
const payload = {
    processId: this.selectedProcess.value?.processId,
    pages: this.selectedPages.value?.join(",")
  };

  this.http.post<any[]>('Rule/get-dashboard-data', payload).subscribe((res) => {
    this.complianceData = res || [];
    this.currentPageIndex = 0; // reset on load
    
    this.complianceData = res || [];
    this.currentPageIndex = 0;
    this.updateChartData();
  });
  }
}
