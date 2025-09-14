# Export/Import Functionality

This application now supports exporting and importing orders and production plans.

## Features

### Export

- Export current orders and production plan to a JSON file
- File is automatically downloaded with a timestamp in the filename
- Includes metadata like export date and version

### Import

- Import orders and production plan from a previously exported JSON file
- Validates the imported data structure
- Shows success/error messages
- Supports importing just orders or both orders and production plan

## Usage

### Export

1. Click the "Export" button in either the Current Orders or Production Plan section
2. A JSON file will be automatically downloaded to your default downloads folder
3. The filename will include the current date (e.g., `idle-ingredients-export-2024-01-15.json`)

### Import

1. Click the "Import" button in either the Current Orders or Production Plan section
2. Select a previously exported JSON file
3. The application will validate and import the data
4. You'll see a success message showing what was imported

## File Format

The exported JSON file contains:

```json
{
  "orders": [...],
  "productionPlan": {...},
  "exportDate": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Notes

- Importing will replace your current orders and production plan
- The application validates the imported data structure
- If the import fails, you'll see an error message
- The file input is automatically reset after each import attempt
