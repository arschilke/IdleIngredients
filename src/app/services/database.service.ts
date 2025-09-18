import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Country,
  Destination,
  Factory,
  ProductionPlan,
  Resource,
  Train,
  TrainClass,
  TrainEngine,
  PlanningLevel,
  StepType
} from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly maxConcurrentTrains = 5;

  constructor(private http: HttpClient) {}

  // Load data from JSON files
  loadResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>('/assets/resources.json').pipe(
      catchError(() => of(this.getDefaultResources()))
    );
  }

  loadTrains(): Observable<Train[]> {
    return this.http.get<Train[]>('/assets/trains.json').pipe(
      catchError(() => of(this.getDefaultTrains()))
    );
  }

  loadFactories(): Observable<Factory[]> {
    return this.http.get<Factory[]>('/assets/factories.json').pipe(
      catchError(() => of(this.getDefaultFactories()))
    );
  }

  loadDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>('/assets/destinations.json').pipe(
      catchError(() => of(this.getDefaultDestinations()))
    );
  }

  getDefaultProductionPlan(): ProductionPlan {
    return {
      id: '1',
      levels: {
        1: {
          level: 1,
          steps: [],
          inventoryChanges: new Map<string, number>(),
          done: false
        }
      },
      totalTime: 0,
      maxConcurrentWorkers: this.maxConcurrentTrains
    };
  }

  private getDefaultResources(): Resource[] {
    return [
      { id: 'coal', name: 'Coal', icon: 'Icon_Coal.png' },
      { id: 'iron', name: 'Iron', icon: 'Icon_Iron_Ore.png' },
      { id: 'wood', name: 'Oakwood', icon: 'Icon_Wood.png' },
      { id: 'steel', name: 'Steel', icon: 'Icon_Steel.png' },
      { id: 'nails', name: 'Nails', icon: 'Icon_Nails.webp' },
      { id: 'iron_powder', name: 'Iron Powder', icon: 'Icon_Iron_Powder.webp' },
      { id: 'saw_blade', name: 'Saw Blade', icon: 'Icon_Saw_Blade.webp' },
      { id: 'copper_ore', name: 'Copper Ore', icon: 'Icon_Copper_Ore.png' },
      { id: 'copper', name: 'Copper', icon: 'Icon_Copper.webp' },
      { id: 'timber', name: 'Timber', icon: 'Icon_Timber.png' },
      { id: 'chair', name: 'Chair', icon: 'Icon_Chair.webp' },
      { id: 'table', name: 'Table', icon: 'Icon_Table.webp' },
      { id: 'copper_wire', name: 'Copper Wire', icon: 'Icon_Copper_Wire.webp' },
      { id: 'barrel', name: 'Barrel', icon: 'Icon_Barrel.webp' },
      { id: 'oakwood', name: 'Oakwood', icon: 'Icon_Wood.png' },
    ];
  }

  private getDefaultTrains(): Train[] {
    return [
      {
        id: 'train1',
        name: 'FS CLASS 740',
        engine: TrainEngine.Steam,
        capacity: 20,
        class: TrainClass.Common,
        country: Country.Britain,
      },
      {
        id: 'train2',
        name: 'GER CLASS S69',
        engine: TrainEngine.Steam,
        capacity: 20,
        class: TrainClass.Common,
        country: Country.Britain,
      },
      {
        id: 'train3',
        name: 'STAR CLASS 4000',
        engine: TrainEngine.Steam,
        capacity: 20,
        class: TrainClass.Common,
        country: Country.Britain,
      },
      {
        id: 'train4',
        name: 'PRUSSIAN P8',
        engine: TrainEngine.Steam,
        capacity: 20,
        class: TrainClass.Common,
        country: Country.Britain,
      },
      {
        id: 'train5',
        name: 'NORD 140',
        engine: TrainEngine.Steam,
        capacity: 30,
        class: TrainClass.Rare,
        country: Country.Britain,
      },
    ];
  }

  private getDefaultFactories(): Factory[] {
    return [
      {
        id: 'factory1',
        name: 'Iron Smelter',
        queueMaxSize: 5,
        recipes: [
          {
            resourceId: 'iron',
            timeRequired: 60,
            outputAmount: 1,
            requires: [
              { resourceId: 'iron_ore', amount: 2 }
            ],
            factoryId: 'factory1'
          }
        ]
      }
    ];
  }

  private getDefaultDestinations(): Destination[] {
    return [
      {
        id: 'dest1',
        name: 'London',
        travelTime: 120,
        resourceId: 'coal',
        classes: [TrainClass.Common, TrainClass.Rare],
        country: Country.Britain
      }
    ];
  }
}
