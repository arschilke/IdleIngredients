import React, { useState } from 'react';
import { Factory } from './types';

interface FactoryManagerProps {
  factories: Factory[];
  onAdd: (factory: Factory) => void;
  onUpdate: (id: string, factory: Factory) => void;
  onDelete: (id: string) => void;
}

export const FactoryManager: React.FC<FactoryManagerProps> = ({
  factories,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    queueMaxSize: '1',
    availableAt: '0'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      queueMaxSize: '1',
      availableAt: '0'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.queueMaxSize) {
      alert('Please fill in all required fields.');
      return;
    }

    const factory: Factory = {
      id: editingId || '',
      name: formData.name.trim(),
      availableAt: parseInt(formData.availableAt) || 0,
      queue: [],
      queueMaxSize: parseInt(formData.queueMaxSize),
      recipes: []
    };

    if (editingId) {
      onUpdate(editingId, factory);
    } else {
      onAdd(factory);
    }

    resetForm();
  };

  const startEdit = (factory: Factory) => {
    setFormData({
      name: factory.name,
      queueMaxSize: factory.queueMaxSize.toString(),
      availableAt: (factory.availableAt || 0).toString()
    });
    setEditingId(factory.id);
    setIsAdding(true);
  };


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>👥 Factory Manager</h2>
        <button 
          className="btn" 
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          Add New Factory
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Edit Factory' : 'Add New Factory'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="factoryName">Factory Name:</label>
              <input
                id="factoryName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Alice, Bob, Charlie"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="queueMaxSize">Queue Max Size:</label>
              <input
                id="queueMaxSize"
                type="number"
                value={formData.queueMaxSize}
                onChange={(e) => setFormData(prev => ({ ...prev, queueMaxSize: e.target.value }))}
                placeholder="e.g., 1"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="availableAt">Available At (seconds):</label>
              <input
                id="availableAt"
                type="number"
                value={formData.availableAt}
                onChange={(e) => setFormData(prev => ({ ...prev, availableAt: e.target.value }))}
                placeholder="e.g., 0"
                min="0"
                required
              />
              <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                When this factory becomes available (0 = immediately available)
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn">
                {editingId ? 'Update Factory' : 'Add Factory'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Current Factorys</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {factories.map(factory => (
            <div key={factory.id} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0 }}>{factory.name}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => startEdit(factory)}
                    className="btn"
                    style={{ 
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(factory.id)}
                    className="btn"
                    style={{ 
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 100, 100, 0.8)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                <div style={{ 
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {factory.queueMaxSize}
                </div>
                <div>Available: {factory.availableAt === 0 ? 'Immediately' : `${factory.availableAt}s`}</div>
              </div>
            </div>
          ))}
        </div>

        {factories.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            No factorys added yet. Add your first factory to get started!
          </div>
        )}
      </div>

    </div>
  );
};
