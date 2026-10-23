export interface Medicine {
  id: string;
  fullName: string;
  notes: string;
  expiryDate: string;
  quantity: number;
  price: number;
  brand: string;
}

export interface MedicineRequest {
  fullName: string;
  notes: string;
  expiryDate: string;
  quantity: number;
  price: number;
  brand: string;
}

export interface Sale {
  id: string;
  medicineId: string;
  medicineName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  soldAt: string;
}

export interface SaleRequest {
  medicineId: string;
  quantity: number;
}
