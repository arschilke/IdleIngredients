# ER Diagram for IdleIngredients Types

This diagram shows the entity relationships between the interfaces defined in `src/types.ts`.

```mermaid
erDiagram
    Resource {
        string id PK
        string name
        string icon
    }
    
    Train {
        string id PK
        string name
        int capacity
        string class
        string engine
    }
    
    Recipe {
        string resourceId FK
        int timeRequired
        int outputAmount
    }
    
    Factory {
        string id PK
        string name
        int queueMaxSize
    }
    
    Destination {
        string id PK
        int travelTime
        string resourceId FK
        classes: string[]
    }
    
    ResourceRequirement {
        string resourceId FK
        int amount
        int delivered
    }
    
    BaseOrder {
        string id PK
        string name
    }
    
    BoatOrder {
        string id PK
        string type
        int expirationTime
    }
    
    StoryOrder {
        string id PK
        string type
        int travelTime
    }
    
    BuildingOrder {
        string id PK
        string type
    }
    
    PlannedStep {
        string id PK
        PlannedStepType type
        string resourceId FK
        int levelId FK
        int timeRequired
    }
    
    PlanningLevel {
        int id PK
        boolean done
    }
    
    ProductionPlan {
        int maxConcurrentWorkers
    }
    
    %% Relationships
    Factory ||--|{ Recipe : has

    Recipe }o--|| Resource : produces
    Recipe ||--|{ ResourceRequirement : has
    
    Destination }o--|| Resource : produces
    
    BaseOrder ||--o{ ResourceRequirement : requires
    ResourceRequirement }o--|| Resource : references
    
    BoatOrder ||--|| BaseOrder : extends
    StoryOrder ||--|| BaseOrder : extends
    BuildingOrder ||--|| BaseOrder : extends

    PlannedStep }o--|| Recipe : uses
    PlannedStep }o--|| Destination : dispatches
    PlannedStep }o--|| Train : assigned_to
    
    PlanningLevel ||--o{ PlannedStep : contains
    
    ProductionPlan ||--o{ PlanningLevel : contains

```

## Key Relationships Explained:

1. **Resource** is the central entity that connects to many other entities
2. **Train** uses TrainEngine and TrainClass enums
3. **Factory** contains multiple **Recipe**s, each producing a **Resource**
4. **Destination** delivers specific **Resource**s
5. **Order** types (BoatOrder, StoryOrder, BuildingOrder) all extend **BaseOrder**
6. **ResourceRequirement** links orders to the resources they need
7. **PlannedStep** represents individual steps in production planning
8. **PlanningLevel** groups multiple steps together
9. **ProductionPlan** contains multiple planning levels
10. **GameState** is the root entity containing all game data

## Notes:
- PK = Primary Key
- FK = Foreign Key
- The diagram shows inheritance relationships (BaseOrder → Order types)
- Map types (like `Map<string, number>`) are represented as separate inventory tracking
- Enums are shown as separate entities with their possible values
