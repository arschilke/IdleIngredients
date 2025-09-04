import { Order, ProductionPlan } from './types';

export interface ExportData {
  orders: Order[];
  productionPlan: ProductionPlan | null;
  exportDate: string;
  version: string;
}

export function exportOrdersAndPlan(
  orders: Order[],
  productionPlan: ProductionPlan | null
): void {
  const exportData: ExportData = {
    orders,
    productionPlan,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `idle-ingredients-export-${new Date().toISOString().split('T')[0]}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importOrdersAndPlan(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const data: ExportData = JSON.parse(content);

        // Validate the imported data structure
        if (!data.orders || !Array.isArray(data.orders)) {
          throw new Error('Invalid orders data');
        }

        if (data.productionPlan && typeof data.productionPlan !== 'object') {
          throw new Error('Invalid production plan data');
        }

        resolve(data);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function validateImportData(data: any): data is ExportData {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.orders) &&
    (data.productionPlan === null || typeof data.productionPlan === 'object') &&
    typeof data.exportDate === 'string' &&
    typeof data.version === 'string'
  );
}
