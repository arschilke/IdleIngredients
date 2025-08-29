import { Destination, Order, PlannedStep, PlannedStepType, PlanningLevel, ProductionPlan, Recipe, Resource, Train } from "./types";

export class Plan implements ProductionPlan {
    
    levels: PlanningLevel[];
    maxConcurrentWorkers: number;
    inventorySnapshot: Map<string, number>;
    activeLevel: number;

    constructor(maxConcurrentWorkers: number) {
        this.levels = [];
        this.maxConcurrentWorkers = maxConcurrentWorkers;
        this.inventorySnapshot = new Map();
        this.activeLevel = 0;
    }

    get totalTime() {
        return this.levels.reduce((acc, level) => acc + level.estimatedTime, 0);
    }

    addLevel(level: PlanningLevel) {
        this.levels.push(level);
    }

    setActiveLevel(level: number) {
        this.activeLevel = level;
    }
    getActiveLevel() {
        return this.levels[this.activeLevel];
    }

    getBusyTrains(levelIndex: number) {
        const level = this.levels[levelIndex];
        const busyTrains = level.steps.map(step => step.trainId).filter(x => x !== undefined);
        return busyTrains;
    }

    updateLevel(level: number, updatedLevel: PlanningLevel) {
        this.levels[level] = updatedLevel;
    }

}

export class Job implements PlannedStep {
    id: string;
    type: PlannedStepType;
    resource: Resource;
    level: number;
    timeRequired: number;
    dependencies: string[];
    train: Train | undefined;
    resourceId: string;
    recipe?: Recipe | undefined;
    destination?: Destination | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    trainId?: string | undefined;
    order?: Order | undefined;

    constructor(id: string, type: PlannedStepType, resource: Resource, level: number, timeRequired: number, dependencies: string[], trainId: string) {
        this.id = id;
        this.type = type;
        this.resource = resource;
        this.level = level;
        this.timeRequired = timeRequired;
        this.dependencies = dependencies;
        this.resourceId = resource.id;
        this.trainId = trainId;
    }

    getTimeRequired() {
        return this.timeRequired;
    }

    get amountProcessed() {
        return Math.min(this.order?.resources[0].amount || Infinity, this.train?.capacity || 0);
    }
}
