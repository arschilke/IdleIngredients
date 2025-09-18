import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { Resource } from '../../../models/types';
@Component({
  selector: 'app-resource-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-manager.html',
  styleUrls: ['./resource-manager.scss'],
})
export class ResourceManagerComponent {
  resources$: Observable<Record<string, Resource>>;
  constructor(private dataService: DataService) {
    this.resources$ = this.dataService.getResources();
  }
}
