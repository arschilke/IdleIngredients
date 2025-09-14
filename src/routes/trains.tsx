// src/routes/trains.tsx
import { createFileRoute } from '@tanstack/react-router';
import TrainManager from '../features/trains/TrainManager';

export const Route = createFileRoute('/trains')({
  component: TrainManager,
});
