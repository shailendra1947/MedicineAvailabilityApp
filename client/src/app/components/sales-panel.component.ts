import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Medicine, Sale, SaleRequest } from '../models';
import { formatCurrency, formatDateTime } from '../utils';

@Component({
  selector: 'app-sales-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sales-panel.component.html',
})
export class SalesPanelComponent {
  @Input({ required: true }) medicines: Medicine[] = [];
  @Input({ required: true }) sales: Sale[] = [];
  @Input({ required: true }) submitSale!: (payload: SaleRequest) => Promise<Sale>;

  medicineId = '';
  quantity: number | '' = 1;
  error = '';
  saving = false;

  protected readonly formatCurrency = formatCurrency;
  protected readonly formatDateTime = formatDateTime;

  get selected(): Medicine | undefined {
    return this.medicines.find((item) => item.id === this.medicineId);
  }

  get unitPriceLabel(): string {
    return this.selected ? `₹ ${formatCurrency(this.selected.price)}` : '—';
  }

  async onSubmit(): Promise<void> {
    this.error = '';
    this.saving = true;
    try {
      await this.submitSale({
        medicineId: this.medicineId,
        quantity: Number(this.quantity),
      });
      this.quantity = 1;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unable to record sale.';
    } finally {
      this.saving = false;
    }
  }
}
