import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common'; // ✅ Add NgIf & NgFor explicitly
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddRuleDialogComponent } from '../add-rule-dialog/add-rule-dialog.component';
import { OnInit } from '@angular/core';
import { HttpService } from '../../../../core/services/http.service';
import { ProcessItem } from '../../../../core/models/process-item.model';
import { Rule } from '../../../../core/models/rule-item.model';
import { MatSnackBar } from '@angular/material/snack-bar'; // ✅


@Component({
  selector: 'app-rule-builder',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,            // ✅ Add this
    NgFor,           // ✅ Add this
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatDialogModule,
    AddRuleDialogComponent
  ],
  templateUrl: './rule-builder.component.html',
  styleUrls: ['./rule-builder.component.scss']
})

export class RuleBuilderComponent implements OnInit {
  rules: Rule[] = [];
  processMap: Map<string, string> = new Map(); // processId -> processName
  selectedRuleType = 1;
  
  constructor(private dialog: MatDialog, private http: HttpService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProcessesAndRules();
  }  

  selectRuleType(type: number) {
    this.selectedRuleType = type;
    this.loadRules(); 
  }
  loadProcessesAndRules() {
    // Step 1: Get all process names
    this.http.get<ProcessItem[]>('Process/get-process-names').subscribe({
      next: (processes) => {
        this.processMap = new Map(processes.map(p => [p.processId, p.processName]));
        this.loadRules();
      },
      error: (err) => console.error('Failed to load process names', err)
    });
  }

  loadRules() {
    this.http.get<Rule[]>(`Rule/get-rules?ruleType=${this.selectedRuleType}`).subscribe({
      next: (rules) => {
        this.rules = rules;
      },
      error: (err) => console.error('Failed to load rules', err)
    });
  }

  getDisplayName(rule: Rule): string {
    const processName = this.processMap.get(rule.processId) ?? 'Unknown Process';
    return `${processName} - ${rule.stage}`;
  }

  openAddRuleDialog(rule?: Rule) {
    const dialogRef = this.dialog.open(AddRuleDialogComponent, {
      width: '540px',
      maxHeight: 'none',
      panelClass: 'custom-dialog-container',
      data: {
      rule: rule || null,
      ruleType: this.selectedRuleType  // ✅ pass ruleType
    }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRules(); // re-fetch rules
      }
    });
  }

  applyRule(rule: any, runAll: boolean=false) {    
    
    var req= runAll?this.rules:[rule];
    
    this.http.post('Rule/run-rule', req).subscribe({
        next: () => {
          this.snackBar.open('Rule applied successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        },
        error: () => {
          this.snackBar.open('Rule application failed', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        }
      });
    }  
  
}