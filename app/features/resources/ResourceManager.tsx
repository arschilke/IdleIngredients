import { useState } from 'react';
import {
  TrainClass,
  Country,
  type Recipe,
  type ResourceRequirement,
  type Resource,
  type Factory,
  type Destination,
} from '../../../types';
import { Form } from 'react-router';
import { Navbar } from '~/components/layout/Navbar';
import { useAddResource, useResources } from '~/hooks/useResources';
import {
  useAddFactory,
  useFactories,
  useUpdateFactory,
} from '~/hooks/useFactories';
import { useAddDestination, useDestinations } from '~/hooks/useDestinations';
import React from 'react';
import { ResourceForm } from '~/components/forms/ResourceForm';
import { FactoryForm } from '~/components/forms/FactoryForm';
import { RecipeForm } from '~/components/forms/RecipeForm';
import { DestinationForm } from '~/components/forms/DestinationForm';

export default function ResourceManager() {
  const { data: resources = {}, isLoading: resourcesLoading } = useResources();
  const { data: factories = {}, isLoading: factoriesLoading } = useFactories();
  const { data: destinations = {}, isLoading: destinationsLoading } =
    useDestinations();

  if (resourcesLoading || factoriesLoading || destinationsLoading) {
    return (
      <div className="app">
        <Navbar />
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const [isAddingRecipe, setIsAddingRecipe] = useState(-1);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [isAddingFactory, setIsAddingFactory] = useState(false);
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    icon: '',
  });
  const [recipeFormData, setRecipeFormData] = useState({
    resourceId: '',
    timeRequired: 0,
    outputAmount: 0,
    requires: [{ resourceId: '', amount: 0 }] as ResourceRequirement[],
  });
  const [factoryFormData, setFactoryFormData] = useState({
    name: '',
    queueMaxSize: 2,
  });
  const [destinationFormData, setDestinationFormData] = useState({
    id: '',
    resourceId: '',
    travelTime: 60,
    classes: [TrainClass.Common],
    country: Country.Britain,
  });

  const handleAddResource = (resource: Resource) => {
    useAddResource().mutate(resource);
  };

  const handleAddRecipe = (factoryId: string, recipe: Recipe) => {
    const factory = factories[factoryId];
    factory.recipes.push(recipe);
    useUpdateFactory().mutate(factory);
  };

  const handleAddFactory = (factory: Factory) => {
    useAddFactory().mutate(factory);
  };

  const handleAddDestination = (destination: Destination) => {
    useAddDestination().mutate(destination);
  };

  const resetResourceForm = () => {
    setResourceFormData({ name: '', icon: '' });
    setIsAddingResource(false);
  };

  const resetRecipeForm = () => {
    setRecipeFormData({
      resourceId: '',
      timeRequired: 0,
      outputAmount: 0,
      requires: [] as ResourceRequirement[],
    });
    setIsAddingRecipe(-1);
  };
  const resetFactoryForm = () => {
    setFactoryFormData({
      name: '',
      queueMaxSize: 2,
    });
    setIsAddingFactory(false);
  };

  const resetDestinationForm = () => {
    setDestinationFormData({
      id: '',
      resourceId: '',
      travelTime: 60,
      classes: [TrainClass.Common],
      country: Country.Britain,
    });
    setIsAddingDestination(false);
  };

  const getResourceName = (resourceId: string): string => {
    return resources[resourceId]?.name || resourceId;
  };

  return (
    <div className="resource-manager">
      <Navbar />
      <div className="resources">
        <h2>Resources</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddingResource(true)}
        >
          Add Resource
        </button>

        {isAddingResource && (
          <ResourceForm
            onSubmit={handleAddResource}
            onClose={resetResourceForm}
          />
        )}

        <div className="resources-list d-flex gap-2">
          {Object.values(resources).map(resource => (
            <div key={resource.id} className="resource-item">
              <div className="resource-info">
                <h5>{resource.name}</h5>
                <img
                  className="img-fluid"
                  src={`/Assets/${resource.icon}`}
                  alt={resource.name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="factories">
        <h2>Factories</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddingFactory(true)}
        >
          Add Factory
        </button>
        {isAddingFactory && (
          <FactoryForm onSubmit={handleAddFactory} onClose={resetFactoryForm} />
        )}
        <div className="factories-list d-flex flex-wrap gap-2">
          {Object.values(factories).map(factory => (
            <div key={factory.id} className="card factory-item">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h3>{factory.name}</h3>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    type="button"
                    title="Add Recipe"
                    onClick={() => setIsAddingRecipe(factory.id)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <p>Queue Max Size: {factory.queueMaxSize}</p>
                {factory.recipes.map((recipe: Recipe) => (
                  <div key={recipe.resourceId} className="recipe-item">
                    <div className="mb-1 d-flex align-items-center justify-content-between">
                      {recipe.requires.map((require, idx) => (
                        <React.Fragment key={idx}>
                          <span className="badge border border-secondary text-secondary">
                            {require.amount}{' '}
                            {require.resourceId
                              ? resources[require.resourceId].name
                              : require.resourceId}
                          </span>
                          {idx < recipe.requires.length - 1 && (
                            <span className="mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                      <span className="mx-1">→</span>
                      <span className="badge border border-success text-success">
                        {recipe.outputAmount}{' '}
                        {resources[recipe.resourceId].name}
                      </span>
                      <span className="text-muted mx-1">
                        ({recipe.timeRequired}s)
                      </span>
                    </div>
                  </div>
                ))}
                {isAddingRecipe === factory.id && (
                  <RecipeForm
                    onSubmit={recipe => handleAddRecipe(factory.id, recipe)}
                    onClose={resetRecipeForm}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="destinations">
        <h2>Destinations</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddingDestination(true)}
        >
          Add Destination
        </button>

        {isAddingDestination && (
          <DestinationForm onSubmit={handleAddDestination} onClose={resetDestinationForm} />
        )}

        <div className="destinations-list">
          {Object.values(destinations).map(destination => {
            const resource = resources[destination.resourceId];
            return (
              <div key={destination.id} className="destination-item">
                <div className="destination-info">
                  <h3>{destination.id}</h3>
                  <p>Resource: {resource?.name || destination.resourceId}</p>
                  <p>Travel Time: {destination.travelTime}s</p>
                  <p>Country: {destination.country}</p>
                  <p>Classes: {destination.classes.join(', ')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
