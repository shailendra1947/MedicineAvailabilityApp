import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicineRequest } from '../models';

type MedicineFormModel = {
  fullName: string;
  notes: string;
  expiryDate: string;
  quantity: number | '';
  price: number | '';
  brand: string;
};

@Component({
  selector: 'app-add-medicine-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-medicine-form.component.html',
})
export class AddMedicineFormComponent {
  @Input({ required: true }) submitMedicine!: (payload: MedicineRequest) => Promise<void>;

  form: MedicineFormModel = this.emptyForm();
  error = '';
  saving = false;

  async onSubmit(): Promise<void> {
    this.error = '';
    this.saving = true;
    try {
      await this.submitMedicine({
        fullName: this.form.fullName.trim(),
        notes: this.form.notes.trim(),
        expiryDate: this.form.expiryDate,
        quantity: Number(this.form.quantity),
        price: Number(Number(this.form.price).toFixed(2)),
        brand: this.form.brand.trim(),
      });
      this.form = this.emptyForm();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unable to save medicine.';
    } finally {
      this.saving = false;
    }
  }

  private emptyForm(): MedicineFormModel {
    return {
      fullName: '',
      notes: '',
      expiryDate: '',
      quantity: '',
      price: '',
      brand: '',
    };
  }
}
