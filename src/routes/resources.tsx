// src/routes/resources.tsx
import { createFileRoute } from '@tanstack/react-router'
import ResourceManager from '../features/resources/ResourceManager'

export const Route = createFileRoute('/resources')({
  component: ResourceManager,
})