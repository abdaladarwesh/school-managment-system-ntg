import { Component, inject, OnInit, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog } from './audit-model';
import { AuditLogsService } from './audit-logs.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditLogsComponent implements OnInit {
  auditLogsService = inject(AuditLogsService);

  // --- Writable Signals for State ---
  searchTerm = signal<string>('');
  isFilterMenuOpen = signal<boolean>(false);
  selectedAction = signal<string>('All');
  auditLogs = signal<AuditLog[]>([]);

  // Pagination state
  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  totalElements = signal<number>(0);

  // Static properties don't need to be signals
  readonly actionOptions: string[] = ['All', 'INSERT', 'UPDATE', 'DELETE'];

  // --- Computed Signals for Derived State ---

  /** Logs after applying the search term and the selected action filter. */
  filteredLogs = computed(() => {
    // Reading signals inside computed() automatically tracks them as dependencies
    const term = this.searchTerm().trim().toLowerCase();
    const action = this.selectedAction();
    const logs = this.auditLogs();

    return logs.filter((log) => {
      const matchesAction = action === 'All' || log.action === action;

      if (!matchesAction) return false;
      if (!term) return true;

      const haystack = [
        log.changedBy,
        log.editedUserName,
        log.tableName,
        log.action,
        log.changedFields,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(); // filter(Boolean) removes nulls

      return haystack.includes(term);
    });
  });

  activeFilterCount = computed(() => (this.selectedAction() === 'All' ? 0 : 1));

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    // Read the current page signal value when making the API call
    this.auditLogsService.getAuditLogs(this.currentPage(), 20).subscribe({
      next: (response) => {
        console.log(response);
        // Use .set() to update writable signals
        this.auditLogs.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (err) => console.error('Error fetching audit logs:', err),
    });
  }

  // Helper method to generate human-readable details (unchanged as it's a pure function)
  getLogDetails(log: AuditLog): string {
    if (log.action === 'INSERT') {
      return `Created new record in ${log.tableName} for ${log.editedUserName || 'User ID: ' + log.recordId}.`;
    } else if (log.action === 'DELETE') {
      return `Deleted record from ${log.tableName} for ${log.editedUserName || 'User ID: ' + log.recordId}.`;
    } else if (log.action === 'UPDATE' && log.changedFields) {
      return `Updated fields: [${log.changedFields}] for ${log.editedUserName || 'Record ID: ' + log.recordId}.`;
    }
    return 'Modified record.';
  }

  toggleFilterMenu(): void {
    // Use .update() when the new value depends on the previous value
    this.isFilterMenuOpen.update((isOpen) => !isOpen);
  }

  closeFilterMenu(): void {
    this.isFilterMenuOpen.set(false);
  }

  selectActionFilter(action: string): void {
    this.selectedAction.set(action);
    this.isFilterMenuOpen.set(false);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  exportAuditLogs(): void {
    // Read the evaluated value of the computed signal
    const logs = this.filteredLogs();
    if (logs.length === 0) return;

    const headers = [
      'Changed By',
      'Table Name',
      'Action',
      'Edited User',
      'Changed Fields',
      'Timestamp',
    ];

    const escapeCsv = (value: any): string => {
      if (value == null) return '';
      const str = String(value);
      const needsQuoting = /[",\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuoting ? `"${escaped}"` : escaped;
    };

    const rows = logs.map((log) =>
      [
        log.changedBy,
        log.tableName,
        log.action,
        log.editedUserName,
        log.changedFields,
        log.changedAt,
      ]
        .map(escapeCsv)
        .join(','),
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `audit-logs-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
