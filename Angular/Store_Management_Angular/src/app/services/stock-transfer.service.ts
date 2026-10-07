import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  StockTransferRequestModel,
  StockTransferResponseModel,
  StockTransferItemRequestModel,
  StockTransferItemResponseModel,
  StockAdjustmentRequestModel,
  StockAdjustmentResponseModel,
  Inventory
} from '../model/stock-transfer.model';

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {

  // =========================================================
  // API URL
  // =========================================================

  private readonly stockTransferUrl =
    environment.apiUrl + 'stock-transfers';

  private readonly stockTransferItemUrl =
    environment.apiUrl + 'stock-transfer-items';

  private readonly stockAdjustmentUrl =
    environment.apiUrl + 'stock-adjustments';

  private readonly inventoryUrl =
    environment.apiUrl + 'inventory';


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // STOCK TRANSFER
  // =========================================================

  createStockTransfer(
    request: StockTransferRequestModel
  ): Observable<StockTransferResponseModel> {

    return this.http.post<StockTransferResponseModel>(
      this.stockTransferUrl,
      request
    );
  }


  getAllStockTransfers():
    Observable<StockTransferResponseModel[]> {

    return this.http.get<StockTransferResponseModel[]>(
      this.stockTransferUrl
    );
  }


  getStockTransferById(
    id: number
  ): Observable<StockTransferResponseModel> {

    return this.http.get<StockTransferResponseModel>(
      `${this.stockTransferUrl}/${id}`
    );
  }


  updateStockTransfer(
    id: number,
    request: StockTransferRequestModel
  ): Observable<StockTransferResponseModel> {

    return this.http.put<StockTransferResponseModel>(
      `${this.stockTransferUrl}/${id}`,
      request
    );
  }


  deleteStockTransfer(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.stockTransferUrl}/${id}`
    );
  }


  // =========================================================
  // STOCK TRANSFER ITEM
  // =========================================================

  createStockTransferItem(
    request: StockTransferItemRequestModel
  ): Observable<StockTransferItemResponseModel> {

    return this.http.post<StockTransferItemResponseModel>(
      this.stockTransferItemUrl,
      request
    );
  }


  getAllStockTransferItems():
    Observable<StockTransferItemResponseModel[]> {

    return this.http.get<StockTransferItemResponseModel[]>(
      this.stockTransferItemUrl
    );
  }


  getStockTransferItemById(
    id: number
  ): Observable<StockTransferItemResponseModel> {

    return this.http.get<StockTransferItemResponseModel>(
      `${this.stockTransferItemUrl}/${id}`
    );
  }


  getItemsByStockTransferId(
    stockTransferId: number
  ): Observable<StockTransferItemResponseModel[]> {

    return this.http.get<StockTransferItemResponseModel[]>(
      `${this.stockTransferItemUrl}/stock-transfer/${stockTransferId}`
    );
  }


  updateStockTransferItem(
    id: number,
    request: StockTransferItemRequestModel
  ): Observable<StockTransferItemResponseModel> {

    return this.http.put<StockTransferItemResponseModel>(
      `${this.stockTransferItemUrl}/${id}`,
      request
    );
  }


  deleteStockTransferItem(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.stockTransferItemUrl}/${id}`
    );
  }


  // =========================================================
  // STOCK ADJUSTMENT
  // =========================================================

  createStockAdjustment(
    request: StockAdjustmentRequestModel
  ): Observable<StockAdjustmentResponseModel> {

    return this.http.post<StockAdjustmentResponseModel>(
      this.stockAdjustmentUrl,
      request
    );
  }


  getAllStockAdjustments():
    Observable<StockAdjustmentResponseModel[]> {

    return this.http.get<StockAdjustmentResponseModel[]>(
      this.stockAdjustmentUrl
    );
  }


  getStockAdjustmentById(
    id: number
  ): Observable<StockAdjustmentResponseModel> {

    return this.http.get<StockAdjustmentResponseModel>(
      `${this.stockAdjustmentUrl}/${id}`
    );
  }


  updateStockAdjustment(
    id: number,
    request: StockAdjustmentRequestModel
  ): Observable<StockAdjustmentResponseModel> {

    return this.http.put<StockAdjustmentResponseModel>(
      `${this.stockAdjustmentUrl}/${id}`,
      request
    );
  }


  deleteStockAdjustment(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.stockAdjustmentUrl}/${id}`
    );
  }


  // =========================================================
  // INVENTORY
  // =========================================================

  getAllInventory():
    Observable<Inventory[]> {

    return this.http.get<Inventory[]>(
      this.inventoryUrl
    );
  }


  getInventoryById(
    id: number
  ): Observable<Inventory> {

    return this.http.get<Inventory>(
      `${this.inventoryUrl}/${id}`
    );
  }


  getInventoryByWarehouse(
    warehouseId: number
  ): Observable<Inventory[]> {

    return this.http.get<Inventory[]>(
      `${this.inventoryUrl}/warehouse/${warehouseId}`
    );
  }


  getInventoryByProduct(
    productId: number
  ): Observable<Inventory[]> {

    return this.http.get<Inventory[]>(
      `${this.inventoryUrl}/product/${productId}`
    );
  }

}