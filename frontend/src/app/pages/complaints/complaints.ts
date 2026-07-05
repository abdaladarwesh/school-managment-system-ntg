import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from './service/complaint.service';
import { BackendComplaint, ComplaintUI } from './service/complaint.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.html',
  styleUrls: ['./complaints.css'],
})
export class ComplaintsComponent implements OnInit {
  private complaintService = inject(ComplaintService);

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

  // --- API FETCH ---

  fetchComplaints() {
    this.complaintService.getComplaints().subscribe({
      next: (data: BackendComplaint[]) => {
        console.log(data);
        this.complaints.set(data.map((item) => this.mapToUI(item)));
      },
      error: () => {
        Swal.fire('Error!', 'Failed to load complaints from server.', 'error');
      },
    });
  }

  private mapToUI(item: BackendComplaint): ComplaintUI {
    const firstName = item.user?.firstName || '';
    const lastName = item.user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
    return {
      id: item.complaintId,
      submitterName: fullName,
      date: item.submittedAt || 'N/A',
      title: item.title,
      description: item.description,
      status: (item.status as 'Pending' | 'Replied') || 'Pending',
      category: item.category || 'General',
      response: item.response,
    };
  }

  // --- FILTERS / COMPUTED ---

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

  // --- MODAL / REPLY ---

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
      .subscribe({
        next: () => {
          this.fetchComplaints();
          this.closeReplyModal();
          Swal.fire('Success!', 'Reply submitted successfully.', 'success');
        },
        error: () => {
          Swal.fire('Error!', 'Could not submit reply. Please try again.', 'error');
        },
      });
  }

  // --- HELPERS ---

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}
