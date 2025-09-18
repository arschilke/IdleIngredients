import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  resources$: Observable<Record<string, any>>;
  orders$: Observable<any[]>;
  productionPlan$: Observable<any>;

  constructor(private dataService: DataService) {
    this.resources$ = this.dataService.getResources();
    this.orders$ = this.dataService.getOrders();
    this.productionPlan$ = this.dataService.getProductionPlan();
  }

  ngOnInit(): void {
    // Component initialization
  }
}