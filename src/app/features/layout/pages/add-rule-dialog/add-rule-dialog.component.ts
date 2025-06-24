import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../../core/services/http.service';
import { ProcessItem } from '../../../../core/models/process-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Rule } from '../../../../core/models/rule-item.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-add-rule-dialog',
  templateUrl: './add-rule-dialog.component.html',
  styleUrls: ['./add-rule-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule
  ]
})
export class AddRuleDialogComponent implements OnInit {
  processes: ProcessItem[] = [];
  pages: string[] = [];
  stages = ['Start', 'Decision', 'Action', 'End'];
  ruleType = 1;
  form1: FormGroup;
  form2: FormGroup;
  form3: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRuleDialogComponent>,
    private http: HttpService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { rule: Rule | null, ruleType: number }
  ) {
    this.ruleType = data.ruleType;

    this.form1 = this.fb.group({
      process: [null, Validators.required],
      pages: [[], Validators.required],
      stage: [[], Validators.required],
      height: ['', Validators.required],
      width: ['', Validators.required],
    });

    this.form2 = this.fb.group({
      process: [null, Validators.required],
      pages: [[], Validators.required],
      stage: [[], Validators.required],
      horizontalSpacing: ['', Validators.required],
      verticalSpacing: ['', Validators.required],
    });

    this.form3 = this.fb.group({
      process: [null, Validators.required],
      pages: [[], Validators.required],
      stage: [[], Validators.required],
      blockNamePrefix: ['', Validators.required],
      dataItemPrefix: ['', Validators.required],
      colorGradient: ['', Validators.required],
    });

    if (data.rule) {
      const form = this.getActiveForm();
      const { processId, pages, stage, parameters } = data.rule;
      const paramParts = parameters?.split(',') ?? [];

      this.http.get<ProcessItem[]>('Process/get-process-names').subscribe({
        next: (processData) => {
          this.processes = processData;
          const matchedProcess = processData.find(p => p.processId === processId);
          form.patchValue({
            process: matchedProcess || null,
            pages: pages?.split(',') || [],
            stage: stage?.split(',') || []
          });

          if (this.ruleType === 1) {
            form.patchValue({
              width: paramParts[0] ?? '',
              height: paramParts[1] ?? ''
            });
          } else if (this.ruleType === 2) {
            form.patchValue({
              horizontalSpacing: paramParts[0] ?? '',
              verticalSpacing: paramParts[1] ?? ''
            });
          } else if (this.ruleType === 3) {
            form.patchValue({
              blockNamePrefix: paramParts[0] ?? '',
              dataItemPrefix: paramParts[1] ?? '',
              colorGradient: paramParts[2] ?? ''
            });
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.loadProcesses();
    this.getActiveForm().get('process')?.valueChanges.subscribe(process => {
      if (process) this.loadPagesForProcess(process.processId);
    });
  }

  compareById = (a: ProcessItem, b: ProcessItem): boolean =>
    a && b && a.processId === b.processId;

  getActiveForm(): FormGroup {
    if (this.ruleType === 2) return this.form2;
    if (this.ruleType === 3) return this.form3;
    return this.form1;
  }

  loadPagesForProcess(processId: string) {
    this.http.get<string[]>(`Process/get-process-details?processId=${processId}`).subscribe({
      next: (data) => {
        this.pages = data;
        this.getActiveForm().get('pages')?.setValue([]);
      },
      error: (err) => {
        console.error('Failed to load pages for process', err);
      }
    });
  }

  loadProcesses() {
    this.http.get<ProcessItem[]>('Process/get-process-names').subscribe({
      next: (data) => (this.processes = data),
      error: (err) => console.error('Failed to load process names', err)
    });
  }

  save() {
    const form = this.getActiveForm();
    if (form.valid) {
      const formValue = form.value;
      let parameters = '';

      if (this.ruleType === 1) {
        parameters = `${formValue.width},${formValue.height}`;
      } else if (this.ruleType === 2) {
        parameters = `${formValue.horizontalSpacing},${formValue.verticalSpacing}`;
      } else if (this.ruleType === 3) {
        parameters = `${formValue.blockNamePrefix},${formValue.dataItemPrefix},${formValue.colorGradient}`;
      }

      const requestBody = {
        id: this.data.rule?.id ?? 0,
        processId: formValue.process.processId,
        userId: 0,
        pages: formValue.pages.join(','),
        stage: formValue.stage.join(','),
        parameters,
        ruleType: this.ruleType
      };

      this.http.post('Rule/save-rule', requestBody).subscribe({
        next: () => {
          this.snackbar.open('✅ Rule saved successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackbar.open('❌ Failed to save rule', 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
