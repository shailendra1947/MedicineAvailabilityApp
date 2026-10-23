import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, takeUntil } from 'rxjs';
import { AddMedicineFormComponent } from './components/add-medicine-form.component';
import { MedicineGridComponent } from './components/medicine-grid.component';
import { SalesPanelComponent } from './components/sales-panel.component';
import { Medicine, MedicineRequest, Sale, SaleRequest } from './models';
import { PharmacyApiService } from './pharmacy-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MedicineGridComponent, AddMedicineFormComponent, SalesPanelComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  tab: 'inventory' | 'add' | 'sales' = 'inventory';
  medicines: Medicine[] = [];
  sales: Sale[] = [];
  search = '';
  loading = true;
  error = '';
  notice = '';

  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly api: PharmacyApiService) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.load(term));
    void this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.search$.next(value);
  }

  addMedicine = async (payload: MedicineRequest): Promise<void> => {
    await firstValueFrom(this.api.addMedicine(payload));
    this.notice = `${payload.fullName} was added to inventory.`;
    this.search = '';
    this.tab = 'inventory';
    await this.load('');
  };

  recordSale = async (payload: SaleRequest): Promise<Sale> => {
    const sale = await firstValueFrom(this.api.recordSale(payload));
    this.notice = `Recorded sale of ${sale.quantity} × ${sale.medicineName}.`;
    await this.load();
    return sale;
  };

  async load(term = this.search): Promise<void> {
    this.error = '';
    this.loading = true;
    try
    {
      const [medicineData, saleData] = await Promise.all([firstValueFrom(this.api.getMedicines(term)),firstValueFrom(this.api.getSales()),]);
      this.medicines = medicineData;
      this.sales = saleData;
    }
    catch (err)
    {
      this.error = err instanceof Error ? err.message : 'Unable to load pharmacy data.';
    }
    finally
    {
      this.loading = false;
    }
  }
}
