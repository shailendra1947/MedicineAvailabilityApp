import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Medicine } from '../models';
import {
  daysUntilExpiry,
  formatCurrency,
  formatDate,
  isExpiringSoon,
  isLowStock,
  rowClass,
} from '../utils';

@Component({
  selector: 'app-medicine-grid',
  standalone: true,
  templateUrl: './medicine-grid.component.html',
})
export class MedicineGridComponent {
  @Input({ required: true }) medicines: Medicine[] = [];
  @Input() loading = false;
  @Input() search = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  protected readonly formatCurrency = formatCurrency;
  protected readonly formatDate = formatDate;
  protected readonly isExpiringSoon = isExpiringSoon;
  protected readonly isLowStock = isLowStock;
  protected readonly rowClass = rowClass;
  protected readonly daysUntilExpiry = daysUntilExpiry;

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
