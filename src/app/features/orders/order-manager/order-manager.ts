import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFormComponent } from '../../../components/forms/order/order.form';
import { NavbarComponent } from '../../../components/layout/navbar/navbar';
import { Observable, map } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { Order, Resource } from '../../../models/types';
import { formatTime } from '../../../utils/utils';

@Component({
  selector: 'app-order-manager',
  standalone: true,
  imports: [CommonModule, OrderFormComponent],
  templateUrl: './order-manager.html',
  styleUrls: ['./order-manager.scss'],
})
export class OrderManagerComponent {
  orders$: Observable<Order[]>;
  resources$: Observable<Record<string, Resource>>;
  
  constructor(private dataService: DataService) {
    this.orders$ = this.dataService.getOrders();
    this.resources$ = this.dataService.getResources();
  }

  removeOrder(id: string) {
    this.dataService.deleteOrder(id);
  }
  
  formatTime(time: number) {
    return formatTime(time);
  }
  
  getResourceName(resourceId: string): Observable<string> {
    return this.resources$.pipe(
      map(resources => resources[resourceId]?.name || resourceId)
    );
  }
}
