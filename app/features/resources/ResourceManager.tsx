import { useState } from 'react';
import {
  type Recipe,
  type Resource,
  type Factory,
  type Destination,
} from '../../../types';
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

export const ResourceManager = () => {
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
    setIsAddingResource(false);
  };

  const resetRecipeForm = () => {
    setIsAddingRecipe(-1);
  };
  const resetFactoryForm = () => {
    setIsAddingFactory(false);  
  };

  const resetDestinationForm = () => {
    setIsAddingDestination(false);  
  };

  const getResourceName = (resourceId: string): string => {
    return resources[resourceId]?.name || resourceId;
  };

  return (
    <div className="resource-manager">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="d-flex align-items-center justify-content-between">
              <h2>Resources</h2>
              <button
                title="Add Resource"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingResource(true)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>

            {isAddingResource && (
              <ResourceForm
                onSubmit={handleAddResource}
                onClose={resetResourceForm}
              />
            )}

            <div className="resources-list row row-cols-2 row-cols-md-3 row-cols-lg-4">
              {Object.values(resources).map(resource => (
                <div key={resource.id} className="col-auto resource-item">
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
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="d-flex align-items-center justify-content-between">
              <h2>Factories</h2>
              <button
                title="Add Factory"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingFactory(true)}
              >
                <i className="bi bi-building-add"></i>
              </button>
            </div>

            {isAddingFactory && (
              <FactoryForm
                onSubmit={handleAddFactory}
                onClose={resetFactoryForm}
              />
            )}
            <div className="factories-list">
              {Object.values(factories).map((factory, index) => (
                <div key={factory.id} className="card w-100 mb-2 factory-item">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <h3>{factory.name}</h3>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        title="Add Recipe"
                        onClick={() => setIsAddingRecipe(index)}
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
                    {isAddingRecipe === index && (
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
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="d-flex align-items-center justify-content-between">
              <h2>Destinations</h2>
              <button
                title="Add Destination"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingDestination(true)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>

            {isAddingDestination && (
              <DestinationForm
                onSubmit={handleAddDestination}
                onClose={resetDestinationForm}
              />
            )}

            <div className="destinations-list">
              {Object.values(destinations).map(destination => {
                const resource = resources[destination.resourceId];
                return (
                  <div
                    key={destination.id}
                    className="card w-100 mb-2 destination-item"
                  >
                    <div className="card-header">
                      <h3>{destination.name}</h3>
                    </div>
                    <div className="card-body">
                      <p>
                        Resource: {resource?.name || destination.resourceId}
                      </p>
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
      </div>
    </div>
  );
};

export default ResourceManager;
