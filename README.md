# 🏭 Idle Ingredients Calculator

A sophisticated web application that helps you calculate the optimal resource production path for completing orders in idle games. The app automatically determines the fastest sequence of production steps while considering resource dependencies, limited workers, and delivery deadlines.

## ✨ Features

- **Smart Resource Calculation**: Automatically calculates all required base resources including dependencies
- **Worker Optimization**: Assigns workers optimally to minimize total production time
- **Dependency Management**: Handles complex resource chains (e.g., Wood → Planks → Furniture)
- **Timeline Visualization**: Shows detailed production timeline with start/complete events
- **Worker Efficiency**: Supports workers with different efficiency multipliers
- **Resource Management**: Easy-to-use interface for managing game resources
- **Order Management**: Create and track orders with delivery deadlines

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. The application will open with sample data to get you started

## 🎮 How to Use

### 1. Calculator Tab (Default)
- **Create Orders**: Input order name, delivery time, and required resources
- **Automatic Calculation**: The app calculates the optimal production plan
- **Results Display**: View production steps, timeline, and worker assignments

### 2. Resources Tab
- **Add Resources**: Define new game resources with production times
- **Set Dependencies**: Specify what resources are needed to produce others
- **Configure Output**: Set how many units are produced per craft

### 3. Workers Tab
- **Add Workers**: Create workers with different efficiency ratings
- **Efficiency Levels**: 
  - Expert (1.5x+): 50% faster than normal
  - Skilled (1.2x): 20% faster than normal
  - Normal (1.0x): Standard speed
  - Novice (0.8x): 20% slower than normal

## 📊 Sample Scenario

The app comes with a sample scenario to demonstrate its capabilities:

**Order**: Furniture Order
**Requirements**: 1 Furniture
**Delivery Time**: 60 minutes

**Resource Chain**:
- Wood (10s) → Planks (20s, requires 2 Wood)
- Iron Ore (30s) → Nails (25s, requires 1 Iron Ore)
- Planks + Nails → Furniture (120s, requires 4 Planks + 2 Nails)

**Result**: The app calculates that you need 4 Wood, 2 Iron Ore, and shows the optimal worker assignments to complete the order in the shortest time possible.

## 🔧 Technical Details

### Core Algorithm
The application uses a sophisticated algorithm that:
1. **Calculates Dependencies**: Recursively determines all required base resources
2. **Topological Sorting**: Orders production steps to respect dependencies
3. **Worker Assignment**: Optimizes worker allocation using a greedy algorithm
4. **Timeline Generation**: Creates a detailed production schedule

### Performance Features
- **Efficient Calculations**: O(n²) complexity for most operations
- **Real-time Updates**: Instant recalculation when resources or workers change
- **Responsive Design**: Works on desktop and mobile devices

## 🎨 Customization

### Adding New Resources
1. Go to the Resources tab
2. Click "Add New Resource"
3. Set name, production time, and output amount
4. Add any required base resources

### Managing Workers
1. Go to the Workers tab
2. Add workers with different efficiency ratings
3. Set availability times for staggered starts

### Complex Production Chains
The app supports arbitrarily complex production chains:
- Multiple dependency levels
- Circular dependency detection
- Variable output amounts per craft

## 🚨 Troubleshooting

### Common Issues
- **"Circular dependency detected"**: Check if resources depend on each other in a loop
- **"Cannot be completed on time"**: Add more workers or optimize resource chains
- **Calculation errors**: Ensure all resource requirements are properly set

### Performance Tips
- Keep resource chains under 10 levels deep for best performance
- Use worker efficiency ratings strategically
- Consider breaking large orders into smaller ones

## 🛠️ Development

### Project Structure
```
src/
├── types.ts          # TypeScript interfaces
├── calculator.ts     # Core calculation engine
├── App.tsx          # Main application component
├── OrderForm.tsx    # Order creation form
├── ProductionResults.tsx # Results display
├── ResourceManager.tsx   # Resource management
├── WorkerManager.tsx     # Worker management
└── index.css        # Styling
```

### Building for Production
```bash
npm run build
```

### Technologies Used
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Modern CSS** with responsive design
- **Algorithmic optimization** for production planning

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

---

**Happy Idle Gaming! 🎮✨**
