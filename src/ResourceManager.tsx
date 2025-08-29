import React, { useState } from 'react';
import { Resource, Factory, Destination, Recipe, ResourceRequirement } from './types';

interface ResourceManagerProps {
  resources: Resource[];
  onResourcesChange: (resources: Resource[]) => void;
  factories: Factory[];
  onFactoriesChange: (factories: Factory[]) => void;
  destinations: Destination[];
  onDestinationsChange: (destinations: Destination[]) => void;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({
  resources,
  onResourcesChange,
  factories,
  onFactoriesChange,
  destinations,
  onDestinationsChange
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'factories' | 'destinations'>('resources');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    name: ''
  });
  const [factoryFormData, setFactoryFormData] = useState({
    name: '',
    queueMaxSize: 10
  });
  const [destinationFormData, setDestinationFormData] = useState({
    resourceId: '',
    travelTime: 60
  });
  
  // Recipe management state
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [recipeFormData, setRecipeFormData] = useState({
    resourceId: '',
    timeRequired: 60,
    outputAmount: 1,
    requirements: [] as ResourceRequirement[]
  });

  const resetResourceForm = () => {
    setResourceFormData({ name: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const resetFactoryForm = () => {
    setFactoryFormData({ name: '', queueMaxSize: 10 });
    setIsAdding(false);
    setEditingId(null);
  };

  const resetDestinationForm = () => {
    setDestinationFormData({ resourceId: '', travelTime: 60 });
    setIsAdding(false);
    setEditingId(null);
  };

  const resetRecipeForm = () => {
    setRecipeFormData({
      resourceId: '',
      timeRequired: 60,
      outputAmount: 1,
      requirements: []
    });
    setIsAddingRecipe(false);
    setEditingRecipeId(null);
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resourceFormData.name) {
      alert('Please fill in the resource name.');
      return;
    }

    const resource: Resource = {
      id: editingId || `resource_${Date.now()}`,
      name: resourceFormData.name.trim()
    };

    if (editingId) {
      onResourcesChange(resources.map(r => r.id === editingId ? resource : r));
    } else {
      onResourcesChange([...resources, resource]);
    }

    resetResourceForm();
  };

  const handleFactorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!factoryFormData.name) {
      alert('Please fill in the factory name.');
      return;
    }

    const factory: Factory = {
      id: editingId || `factory_${Date.now()}`,
      name: factoryFormData.name.trim(),
      availableAt: 0,
      queue: [],
      queueMaxSize: factoryFormData.queueMaxSize,
      recipes: []
    };

    if (editingId) {
      onFactoriesChange(factories.map(f => f.id === editingId ? factory : f));
    } else {
      onFactoriesChange([...factories, factory]);
    }

    resetFactoryForm();
  };

  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destinationFormData.resourceId) {
      alert('Please select a resource.');
      return;
    }

    const destination: Destination = {
      id: editingId || `destination_${Date.now()}`,
      resourceId: destinationFormData.resourceId,
      travelTime: destinationFormData.travelTime,
      classes: ['common', 'rare', 'epic', 'legendary'] // Default to all classes
    };

    if (editingId) {
      onDestinationsChange(destinations.map(d => d.id === editingId ? destination : d));
    } else {
      onDestinationsChange([...destinations, destination]);
    }

    resetDestinationForm();
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeFormData.resourceId) {
      alert('Please select a resource to produce.');
      return;
    }

    if (recipeFormData.requirements.length === 0) {
      alert('Please add at least one requirement.');
      return;
    }

    const recipe: Recipe = {
      resourceId: recipeFormData.resourceId,
      timeRequired: recipeFormData.timeRequired,
      outputAmount: recipeFormData.outputAmount,
      requires: [...recipeFormData.requirements]
    };

    if (!selectedFactory) return;

    const updatedFactory: Factory = {
      ...selectedFactory,
      recipes: editingRecipeId 
        ? selectedFactory.recipes.map(r => r.resourceId === editingRecipeId ? recipe : r)
        : [...selectedFactory.recipes, recipe]
    };

    onFactoriesChange(factories.map(f => f.id === selectedFactory.id ? updatedFactory : f));
    resetRecipeForm();
  };

  const addRequirement = () => {
    setRecipeFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { resourceId: '', amount: 1 }]
    }));
  };

  const updateRequirement = (index: number, field: keyof ResourceRequirement, value: string | number) => {
    setRecipeFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const removeRequirement = (index: number) => {
    setRecipeFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const deleteResource = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      onResourcesChange(resources.filter(r => r.id !== id));
    }
  };

  const deleteFactory = (id: string) => {
    if (confirm('Are you sure you want to delete this factory?')) {
      onFactoriesChange(factories.filter(f => f.id !== id));
      if (selectedFactory?.id === id) {
        setSelectedFactory(null);
      }
    }
  };

  const deleteDestination = (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      onDestinationsChange(destinations.filter(d => d.id !== id));
    }
  };

  const deleteRecipe = (recipeId: string) => {
    if (!selectedFactory) return;
    
    if (confirm('Are you sure you want to delete this recipe?')) {
      const updatedFactory: Factory = {
        ...selectedFactory,
        recipes: selectedFactory.recipes.filter(r => r.resourceId !== recipeId)
      };
      onFactoriesChange(factories.map(f => f.id === selectedFactory.id ? updatedFactory : f));
    }
  };

  const startEditResource = (resource: Resource) => {
    setResourceFormData({ name: resource.name });
    setEditingId(resource.id);
    setIsAdding(true);
  };

  const startEditFactory = (factory: Factory) => {
    setFactoryFormData({ name: factory.name, queueMaxSize: factory.queueMaxSize });
    setEditingId(factory.id);
    setIsAdding(true);
  };

  const startEditDestination = (destination: Destination) => {
    setDestinationFormData({ 
      resourceId: destination.resourceId, 
      travelTime: destination.travelTime 
    });
    setEditingId(destination.id);
    setIsAdding(true);
  };

  const startEditRecipe = (recipe: Recipe) => {
    setRecipeFormData({
      resourceId: recipe.resourceId,
      timeRequired: recipe.timeRequired,
      outputAmount: recipe.outputAmount || 1,
      requirements: [...recipe.requires]
    });
    setEditingRecipeId(recipe.resourceId);
    setIsAddingRecipe(true);
  };

  const getResourceName = (resourceId: string) => {
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

      {activeTab === 'resources' && (
        <div className="tab-content">
          <h2>Resources</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Add Resource
          </button>

          {isAdding && (
            <form onSubmit={handleResourceSubmit} className="form">
              <div className="form-group">
                <label htmlFor="resourceName">Resource Name:</label>
                <input
                  id="resourceName"
                  type="text"
                  value={resourceFormData.name}
                  onChange={(e) => setResourceFormData({ name: e.target.value })}
                  placeholder="Enter resource name"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Resource
                </button>
                <button type="button" className="btn" onClick={resetResourceForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="resources-list">
            {resources.map(resource => (
              <div key={resource.id} className="resource-item">
                <div className="resource-info">
                  <h3>{resource.name}</h3>
                  <p>ID: {resource.id}</p>
                </div>
                <div className="resource-actions">
                  <button 
                    className="btn"
                    onClick={() => startEditResource(resource)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteResource(resource.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'factories' && (
        <div className="tab-content">
          <h2>Factories</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Add Factory
          </button>

          {isAdding && (
            <form onSubmit={handleFactorySubmit} className="form">
              <div className="form-group">
                <label htmlFor="factoryName">Factory Name:</label>
                <input
                  id="factoryName"
                  type="text"
                  value={factoryFormData.name}
                  onChange={(e) => setFactoryFormData({ ...factoryFormData, name: e.target.value })}
                  placeholder="Enter factory name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="queueMaxSize">Queue Max Size:</label>
                <input
                  id="queueMaxSize"
                  type="number"
                  value={factoryFormData.queueMaxSize}
                  onChange={(e) => setFactoryFormData({ ...factoryFormData, queueMaxSize: parseInt(e.target.value) || 10 })}
                  min="1"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Factory
                </button>
                <button type="button" className="btn" onClick={resetFactoryForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="factories-list">
            {factories.map(factory => (
              <div key={factory.id} className="factory-item">
                <div className="factory-info">
                  <h3>{factory.name}</h3>
                  <p>Queue Max Size: {factory.queueMaxSize}</p>
                  <p>Recipes: {factory.recipes.length}</p>
                </div>
                <div className="factory-actions">
                  <button 
                    className="btn"
                    onClick={() => startEditFactory(factory)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedFactory(factory)}
                  >
                    Manage Recipes
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteFactory(factory.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recipe Management Modal */}
          {selectedFactory && (
            <div className="recipe-modal">
              <div className="recipe-modal-content">
                <div className="recipe-modal-header">
                  <h3>Manage Recipes for {selectedFactory.name}</h3>
                  <button 
                    className="btn"
                    onClick={() => setSelectedFactory(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="recipe-list">
                  <h4>Current Recipes</h4>
                  {selectedFactory.recipes.map(recipe => (
                    <div key={recipe.resourceId} className="recipe-item">
                      <div className="recipe-info">
                        <h5>Produces: {getResourceName(recipe.resourceId)}</h5>
                        <p>Time: {recipe.timeRequired}s</p>
                        <p>Output: {recipe.outputAmount || 1}</p>
                        <p>Requires: {recipe.requires.map(req => 
                          `${req.amount} ${getResourceName(req.resourceId)}`
                        ).join(', ')}</p>
                      </div>
                      <div className="recipe-actions">
                        <button 
                          className="btn"
                          onClick={() => startEditRecipe(recipe)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => deleteRecipe(recipe.resourceId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-recipe-section">
                  <h4>Add New Recipe</h4>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsAddingRecipe(true)}
                  >
                    Add Recipe
                  </button>

                  {isAddingRecipe && (
                    <form onSubmit={handleRecipeSubmit} className="form">
                      <div className="form-group">
                        <label htmlFor="recipeResource">Produces Resource:</label>
                        <select
                          id="recipeResource"
                          value={recipeFormData.resourceId}
                          onChange={(e) => setRecipeFormData({ ...recipeFormData, resourceId: e.target.value })}
                          required
                        >
                          <option value="">Select a resource to produce</option>
                          {resources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                              {resource.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="recipeTime">Production Time (seconds):</label>
                        <input
                          id="recipeTime"
                          type="number"
                          value={recipeFormData.timeRequired}
                          onChange={(e) => setRecipeFormData({ ...recipeFormData, timeRequired: parseInt(e.target.value) || 60 })}
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="recipeOutput">Output Amount:</label>
                        <input
                          id="recipeOutput"
                          type="number"
                          value={recipeFormData.outputAmount}
                          onChange={(e) => setRecipeFormData({ ...recipeFormData, outputAmount: parseInt(e.target.value) || 1 })}
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Resource Requirements:</label>
                        <button 
                          type="button" 
                          onClick={addRequirement}
                          className="btn"
                          style={{ marginBottom: '1rem' }}
                        >
                          Add Requirement
                        </button>
                        
                        {recipeFormData.requirements.map((req, index) => (
                          <div key={index} className="requirement-row">
                            <select
                              value={req.resourceId}
                              onChange={(e) => updateRequirement(index, 'resourceId', e.target.value)}
                              required
                            >
                              <option value="">Select resource...</option>
                              {resources.map(resource => (
                                <option key={resource.id} value={resource.id}>
                                  {resource.name}
                                </option>
                              ))}
                            </select>
                            
                            <input
                              type="number"
                              value={req.amount}
                              onChange={(e) => updateRequirement(index, 'amount', parseInt(e.target.value) || 1)}
                              placeholder="Amount"
                              min="1"
                              required
                            />
                            
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="btn btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          {editingRecipeId ? 'Update' : 'Add'} Recipe
                        </button>
                        <button type="button" className="btn" onClick={resetRecipeForm}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="tab-content">
          <h2>Destinations</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Add Destination
          </button>

          {isAdding && (
            <form onSubmit={handleDestinationSubmit} className="form">
              <div className="form-group">
                <label htmlFor="destinationResource">Resource:</label>
                <select
                  id="destinationResource"
                  value={destinationFormData.resourceId}
                  onChange={(e) => setDestinationFormData({ ...destinationFormData, resourceId: e.target.value })}
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
                  value={destinationFormData.travelTime}
                  onChange={(e) => setDestinationFormData({ ...destinationFormData, travelTime: parseInt(e.target.value) || 60 })}
                  min="1"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Destination
                </button>
                <button type="button" className="btn" onClick={resetDestinationForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="destinations-list">
            {destinations.map(destination => {
              const resource = resources.find(r => r.id === destination.resourceId);
              return (
                <div key={destination.id} className="destination-item">
                  <div className="destination-info">
                    <h3>{destination.id}</h3>
                    <p>Resource: {resource?.name || destination.resourceId}</p>
                    <p>Travel Time: {destination.travelTime}s</p>
                  </div>
                  <div className="destination-actions">
                    <button 
                      className="btn"
                      onClick={() => startEditDestination(destination)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => deleteDestination(destination.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
