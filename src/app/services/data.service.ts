import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';
import { DatabaseService } from './database.service';
import { Resource, Factory, Destination, Train, Order, ProductionPlan } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // BehaviorSubjects for reactive data
  private resourcesSubject = new BehaviorSubject<Record<string, Resource>>({});
  private factoriesSubject = new BehaviorSubject<Record<string, Factory>>({});
  private destinationsSubject = new BehaviorSubject<Record<string, Destination>>({});
  private trainsSubject = new BehaviorSubject<Record<string, Train>>({});
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private productionPlanSubject = new BehaviorSubject<ProductionPlan | null>(null);

  // Observables
  public resources$ = this.resourcesSubject.asObservable();
  public factories$ = this.factoriesSubject.asObservable();
  public destinations$ = this.destinationsSubject.asObservable();
  public trains$ = this.trainsSubject.asObservable();
  public orders$ = this.ordersSubject.asObservable();
  public productionPlan$ = this.productionPlanSubject.asObservable();

  constructor(
    private localStorageService: LocalStorageService,
    private databaseService: DatabaseService
  ) {
    this.loadAllData();
  }

  private loadAllData(): void {
    // Load resources
    const storedResources = this.localStorageService.loadResourcesFromStorage();
    if (this.isEmpty(storedResources)) {
      this.databaseService.loadResources().subscribe(resources => {
        const resourcesMap = this.arrayToMap(resources);
        this.resourcesSubject.next(resourcesMap);
        this.localStorageService.saveResourcesToStorage(resourcesMap);
      });
    } else {
      this.resourcesSubject.next(storedResources);
    }

    // Load factories
    const storedFactories = this.localStorageService.loadFactoriesFromStorage();
    if (this.isEmpty(storedFactories)) {
      this.databaseService.loadFactories().subscribe(factories => {
        const factoriesMap = this.arrayToMap(factories);
        this.factoriesSubject.next(factoriesMap);
        this.localStorageService.saveFactoriesToStorage(factoriesMap);
      });
    } else {
      this.factoriesSubject.next(storedFactories);
    }

    // Load destinations
    const storedDestinations = this.localStorageService.loadDestinationsFromStorage();
    if (this.isEmpty(storedDestinations)) {
      this.databaseService.loadDestinations().subscribe(destinations => {
        const destinationsMap = this.arrayToMap(destinations);
        this.destinationsSubject.next(destinationsMap);
        this.localStorageService.saveDestinationsToStorage(destinationsMap);
      });
    } else {
      this.destinationsSubject.next(storedDestinations);
    }

    // Load trains
    const storedTrains = this.localStorageService.loadTrainsFromStorage();
    if (this.isEmpty(storedTrains)) {
      this.databaseService.loadTrains().subscribe(trains => {
        const trainsMap = this.arrayToMap(trains);
        this.trainsSubject.next(trainsMap);
        this.localStorageService.saveTrainsToStorage(trainsMap);
      });
    } else {
      this.trainsSubject.next(storedTrains);
    }

    // Load orders (no defaults needed)
    this.ordersSubject.next(this.localStorageService.loadOrdersFromStorage());
    
    // Load production plan (no defaults needed)
    this.productionPlanSubject.next(this.localStorageService.loadProductionPlanFromStorage());
  }

  // Resource methods
  getResources(): Observable<Record<string, Resource>> {
    return this.resources$;
  }

  getResource(id: string): Observable<Resource | undefined> {
    return this.resources$.pipe(
      map(resources => resources[id])
    );
  }

  addResource(resource: Resource): void {
    const currentResources = this.resourcesSubject.value;
    const updatedResources = { ...currentResources, [resource.id]: resource };
    this.resourcesSubject.next(updatedResources);
    this.localStorageService.saveResourcesToStorage(updatedResources);
  }

  updateResource(resource: Resource): void {
    this.addResource(resource); // Same logic for add/update
  }

  deleteResource(id: string): void {
    const currentResources = this.resourcesSubject.value;
    const { [id]: deleted, ...remainingResources } = currentResources;
    this.resourcesSubject.next(remainingResources);
    this.localStorageService.saveResourcesToStorage(remainingResources);
  }

  // Factory methods
  getFactories(): Observable<Record<string, Factory>> {
    return this.factories$;
  }

  getFactory(id: string): Observable<Factory | undefined> {
    return this.factories$.pipe(
      map(factories => factories[id])
    );
  }

  addFactory(factory: Factory): void {
    const currentFactories = this.factoriesSubject.value;
    const updatedFactories = { ...currentFactories, [factory.id]: factory };
    this.factoriesSubject.next(updatedFactories);
    this.localStorageService.saveFactoriesToStorage(updatedFactories);
  }

  updateFactory(factory: Factory): void {
    this.addFactory(factory);
  }

  deleteFactory(id: string): void {
    const currentFactories = this.factoriesSubject.value;
    const { [id]: deleted, ...remainingFactories } = currentFactories;
    this.factoriesSubject.next(remainingFactories);
    this.localStorageService.saveFactoriesToStorage(remainingFactories);
  }

  // Destination methods
  getDestinations(): Observable<Record<string, Destination>> {
    return this.destinations$;
  }

  getDestination(id: string): Observable<Destination | undefined> {
    return this.destinations$.pipe(
      map(destinations => destinations[id])
    );
  }

  addDestination(destination: Destination): void {
    const currentDestinations = this.destinationsSubject.value;
    const updatedDestinations = { ...currentDestinations, [destination.id]: destination };
    this.destinationsSubject.next(updatedDestinations);
    this.localStorageService.saveDestinationsToStorage(updatedDestinations);
  }

  updateDestination(destination: Destination): void {
    this.addDestination(destination);
  }

  deleteDestination(id: string): void {
    const currentDestinations = this.destinationsSubject.value;
    const { [id]: deleted, ...remainingDestinations } = currentDestinations;
    this.destinationsSubject.next(remainingDestinations);
    this.localStorageService.saveDestinationsToStorage(remainingDestinations);
  }

  // Train methods
  getTrains(): Observable<Record<string, Train>> {
    return this.trains$;
  }

  getTrain(id: string): Observable<Train | undefined> {
    return this.trains$.pipe(
      map(trains => trains[id])
    );
  }

  addTrain(train: Train): void {
    const currentTrains = this.trainsSubject.value;
    const updatedTrains = { ...currentTrains, [train.id]: train };
    this.trainsSubject.next(updatedTrains);
    this.localStorageService.saveTrainsToStorage(updatedTrains);
  }

  updateTrain(train: Train): void {
    this.addTrain(train);
  }

  deleteTrain(id: string): void {
    const currentTrains = this.trainsSubject.value;
    const { [id]: deleted, ...remainingTrains } = currentTrains;
    this.trainsSubject.next(remainingTrains);
    this.localStorageService.saveTrainsToStorage(remainingTrains);
  }

  // Order methods
  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getOrder(id: string): Observable<Order | undefined> {
    return this.orders$.pipe(
      map(orders => orders.find(order => order.id === id))
    );
  }

  addOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = [...currentOrders, order];
    this.ordersSubject.next(updatedOrders);
    this.localStorageService.saveOrdersToStorage(updatedOrders);
  }

  updateOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.map(o => o.id === order.id ? order : o);
    this.ordersSubject.next(updatedOrders);
    this.localStorageService.saveOrdersToStorage(updatedOrders);
  }

  deleteOrder(id: string): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.filter(order => order.id !== id);
    this.ordersSubject.next(updatedOrders);
    this.localStorageService.saveOrdersToStorage(updatedOrders);
  }

  // Production Plan methods
  getProductionPlan(): Observable<ProductionPlan | null> {
    return this.productionPlan$;
  }

  updateProductionPlan(plan: ProductionPlan): void {
    this.productionPlanSubject.next(plan);
    this.localStorageService.saveProductionPlanToStorage(plan);
  }

  clearProductionPlan(): void {
    this.productionPlanSubject.next(null);
    this.localStorageService.clearAllData();
  }

  // Helper methods
  private isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0;
  }

  private arrayToMap<T extends { id: string }>(array: T[]): Record<string, T> {
    return array.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {} as Record<string, T>);
  }
}
