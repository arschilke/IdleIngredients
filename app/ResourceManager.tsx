import React, { useState } from 'react';
import type {
  Destination,
  Recipe,
} from '../types';
import { TrainClass, Country } from '../types';
import { db } from '../db';
import type { Route } from './+types/ResourceManager';
import { Form, useLoaderData, useActionData } from 'react-router';

export async function loader() {
  const resources = await db.getResources();
  const factories = await db.getFactories();
  const destinations = await db.getDestinations();
  return { resources, factories, destinations };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  
  switch (actionType) {
    case 'addResource': {
      const name = (formData.get('name') as string) ?? '';
      const icon = (formData.get('icon') as string) ?? '';
      const resource = await db.addResource(name, icon);
      return { success: true, resource };
    }
    
    case 'addRecipe': {
      const factoryId = (formData.get('factoryId') as string) ?? '';
      const resourceId = (formData.get('resourceId') as string) ?? '';
      const timeRequired = parseInt((formData.get('timeRequired') as string) ?? '60');
      const outputAmount = parseInt((formData.get('outputAmount') as string) ?? '1');
      const requirementsJson = formData.get('requirements') as string;
      const requirements = requirementsJson ? JSON.parse(requirementsJson) : [];
      
      const recipe: Recipe = {
        resourceId,
        timeRequired,
        outputAmount,
        requires: requirements,
      };
      
      await db.addRecipe(factoryId, recipe);
      return { success: true, recipe };
    }
    
    case 'addDestination': {
      const id = (formData.get('id') as string) ?? '';
      const resourceId = (formData.get('resourceId') as string) ?? '';
      const travelTime = parseInt((formData.get('travelTime') as string) ?? '60');
      const classesJson = formData.get('classes') as string;
      const classes = classesJson ? JSON.parse(classesJson) : [TrainClass.Common];
      const country = (formData.get('country') as Country) ?? Country.Britain;
      
      const destination: Destination = {
        id,
        resourceId,
        travelTime,
        classes,
        country,
      };
      
      await db.addDestination(destination);
      return { success: true, destination };
    }
    
    default:
      return { success: false, error: 'Unknown action' };
  }
}

export default function ResourceManager() {
  const { resources, factories, destinations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [activeTab, setActiveTab] = useState<
    'resources' | 'factories' | 'destinations'
  >('resources');
  const [isAdding, setIsAdding] = useState(false);
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    icon: '',
  });
  const [destinationFormData, setDestinationFormData] = useState({
    id: '',
    resourceId: '',
    travelTime: 60,
    classes: [TrainClass.Common],
    country: Country.Britain,
  });

  const resetResourceForm = () => {
    setResourceFormData({ name: '', icon: '' });
    setIsAdding(false);
  };

  const resetDestinationForm = () => {
    setDestinationFormData({ 
      id: '', 
      resourceId: '', 
      travelTime: 60, 
      classes: [TrainClass.Common], 
      country: Country.Britain 
    });
    setIsAdding(false);
  };

  const getResourceName = (resourceId: string): string => {
    return resources.find(r => r.id === resourceId)?.name || resourceId;
  };

  return (
    <div className="resource-manager">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
        <button
          className={`tab-button ${activeTab === 'factories' ? 'active' : ''}`}
          onClick={() => setActiveTab('factories')}
        >
          Factories
        </button>
        <button
          className={`tab-button ${activeTab === 'destinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('destinations')}
        >
          Destinations
        </button>
      </div>

      {actionData?.success && (
        <div className="alert alert-success">
          Successfully added {actionData.resource ? 'resource' : actionData.destination ? 'destination' : 'recipe'}!
        </div>
      )}

      {actionData?.error && (
        <div className="alert alert-danger">
          Error: {actionData.error}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="tab-content">
          <h2>Resources</h2>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            Add Resource
          </button>

          {isAdding && (
            <Form method="post" className="form">
              <input type="hidden" name="actionType" value="addResource" />
              <div className="form-group">
                <label htmlFor="resourceName">Resource Name:</label>
                <input
                  id="resourceName"
                  type="text"
                  name="name"
                  value={resourceFormData.name}
                  onChange={e => setResourceFormData({ ...resourceFormData, name: e.target.value })}
                  placeholder="Enter resource name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="resourceIcon">Icon:</label>
                <input
                  id="resourceIcon"
                  type="text"
                  name="icon"
                  value={resourceFormData.icon}
                  onChange={e => setResourceFormData({ ...resourceFormData, icon: e.target.value })}
                  placeholder="Enter icon filename (e.g., Icon_Coal.png)"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Resource
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={resetResourceForm}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}

          <div className="resources-list">
            {resources.map(resource => (
              <div key={resource.id} className="resource-item">
                <div className="resource-info">
                  <h3>{resource.name}</h3>
                  <p>ID: {resource.id}</p>
                  <p>Icon: {resource.icon}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'factories' && (
        <div className="tab-content">
          <h2>Factories</h2>
          <div className="factories-list">
            {factories.map(factory => (
              <div key={factory.id} className="factory-item">
                <div className="factory-info">
                  <h3>{factory.name}</h3>
                  <p>ID: {factory.id}</p>
                  <p>Queue Max Size: {factory.queueMaxSize}</p>
                  <p>Recipes: {factory.recipes.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="tab-content">
          <h2>Destinations</h2>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            Add Destination
          </button>

          {isAdding && (
            <Form method="post" className="form">
              <input type="hidden" name="actionType" value="addDestination" />
              <div className="form-group">
                <label htmlFor="destinationId">Destination ID:</label>
                <input
                  id="destinationId"
                  type="text"
                  name="id"
                  value={destinationFormData.id}
                  onChange={e =>
                    setDestinationFormData({
                      ...destinationFormData,
                      id: e.target.value,
                    })
                  }
                  placeholder="Enter destination ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="destinationResource">Resource:</label>
                <select
                  id="destinationResource"
                  name="resourceId"
                  value={destinationFormData.resourceId}
                  onChange={e =>
                    setDestinationFormData({
                      ...destinationFormData,
                      resourceId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a resource</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="travelTime">Travel Time (seconds):</label>
                <input
                  id="travelTime"
                  type="number"
                  name="travelTime"
                  value={destinationFormData.travelTime}
                  onChange={e =>
                    setDestinationFormData({
                      ...destinationFormData,
                      travelTime: parseInt(e.target.value) || 60,
                    })
                  }
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="destinationCountry">Country:</label>
                <select
                  id="destinationCountry"
                  name="country"
                  value={destinationFormData.country}
                  onChange={e =>
                    setDestinationFormData({
                      ...destinationFormData,
                      country: e.target.value as Country,
                    })
                  }
                  required
                >
                  {Object.values(Country).map(country => (
                    <option key={country} value={country}>
                      {country.charAt(0).toUpperCase() + country.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Allowed Train Classes:</label>
                <div className="checkbox-group">
                  {Object.values(TrainClass).map(trainClass => (
                    <label key={trainClass} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={destinationFormData.classes.includes(trainClass)}
                        onChange={e => {
                          const classes = e.target.checked
                            ? [...destinationFormData.classes, trainClass]
                            : destinationFormData.classes.filter(c => c !== trainClass);
                          setDestinationFormData({
                            ...destinationFormData,
                            classes,
                          });
                        }}
                      />
                      {trainClass.charAt(0).toUpperCase() + trainClass.slice(1)}
                    </label>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="classes"
                  value={JSON.stringify(destinationFormData.classes)}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Destination
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={resetDestinationForm}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}

          <div className="destinations-list">
            {destinations.map(destination => {
              const resource = resources.find(
                r => r.id === destination.resourceId
              );
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
      )}
    </div>
  );
}