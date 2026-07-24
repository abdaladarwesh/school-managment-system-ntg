import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from './service/complaint.service';
import { BackendComplaint, ComplaintUI } from './service/complaint.models';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LocalizeNamePipe, DatePipe],
  templateUrl: './complaints.html',
  styleUrls: ['./complaints.css'],
})
export class ComplaintsComponent implements OnInit {
  private readonly complaintService = inject(ComplaintService);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals
  complaints = signal<ComplaintUI[]>([]);
  activeFilter = signal<'All' | 'Pending' | 'Replied'>('All');
  searchText = signal('');

  // Modal state
  isModalOpen = false;
  selectedComplaint: ComplaintUI | null = null;
  replyText = '';

  ngOnInit(): void {
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.complaintService.getComplaints()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: BackendComplaint[]) => {
          this.complaints.set(data.map((item) => this.mapToUI(item)));
        },
        error: (err) => {
          console.error('Failed to load complaints', err);
        },
      });
  }

  private mapToUI(item: BackendComplaint): ComplaintUI {
    const firstName = item.user?.firstName || '';
    const lastName = item.user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';

    const firstNameAr = item.user?.firstNameInArabic || '';
    const lastNameAr = item.user?.lastNameInArabic || '';
    const fullNameAr = `${firstNameAr} ${lastNameAr}`.trim();
    return {
      id: item.complaintId,
      submitterName: fullName,
      submitterNameAr: fullNameAr,
      date: item.submittedAt || 'N/A',
      title: item.title,
      description: item.description,
      status: (item.status as 'Pending' | 'Replied') || 'Pending',
      category: item.category || 'General',
      response: item.response,
    };
  }

  filteredComplaints = computed(() => {
    return this.complaints().filter((c) => {
      const matchFilter =
        this.activeFilter() === 'All' || c.status === this.activeFilter();
      const matchSearch =
        !this.searchText() ||
        c.submitterName.toLowerCase().includes(this.searchText().toLowerCase()) ||
        c.title.toLowerCase().includes(this.searchText().toLowerCase());
      return matchFilter && matchSearch;
    });
  });

  get totalCount(): number {
    return this.complaints().length;
  }

  get repliedCount(): number {
    return this.complaints().filter((c) => c.status === 'Replied').length;
  }

  get pendingCount(): number {
    return this.complaints().filter((c) => c.status === 'Pending').length;
  }

  setFilter(filter: 'All' | 'Pending' | 'Replied') {
    this.activeFilter.set(filter);
  }

  openReplyModal(complaint: ComplaintUI) {
    this.selectedComplaint = complaint;
    this.replyText = complaint.response || '';
    this.isModalOpen = true;
  }

  closeReplyModal() {
    this.isModalOpen = false;
    this.selectedComplaint = null;
    this.replyText = '';
  }

  submitReply() {
    if (!this.selectedComplaint || !this.replyText.trim()) return;

    this.complaintService
      .respondToComplaint(this.selectedComplaint.id, { response: this.replyText.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fetchComplaints();
          this.closeReplyModal();
          this.notificationService.handle200('Reply submitted successfully.');
        },
        error: (err) => {
          console.error('Failed to submit reply', err);
        },
      });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}
