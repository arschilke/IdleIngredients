// src/routes/orders.tsx
import { createFileRoute } from '@tanstack/react-router';
import OrderManager from '../features/orders/OrderManager';

export const Route = createFileRoute('/orders')({
  component: OrderManager,
});
