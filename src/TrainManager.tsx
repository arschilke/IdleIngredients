import React, { useState } from 'react';
import { Train, TrainClass, TrainEngine } from './types';

interface TrainManagerProps {
  trains: Train[];
  onTrainsChange: (trains: Train[]) => void;
}

export const TrainManager: React.FC<TrainManagerProps> = ({
  trains,
  onTrainsChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    class: 'common' as TrainClass,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 10,
      class: TrainClass.Common,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please fill in the train name.');
      return;
    }

    const train: Train = {
      id: editingId || `train_${Date.now()}`,
      name: formData.name.trim(),
      capacity: formData.capacity,
      availableAt: 0,
      class: formData.class as TrainClass,
      engine: TrainEngine.Steam, // Default engine
    };

    if (editingId) {
      onTrainsChange(trains.map(t => (t.id === editingId ? train : t)));
    } else {
      onTrainsChange([...trains, train]);
    }

    resetForm();
  };

  const startEdit = (train: Train) => {
    setFormData({
      name: train.name,
      capacity: train.capacity,
      class: train.class,
    });
    setEditingId(train.id);
    setIsAdding(true);
  };

  const deleteTrain = (id: string) => {
    if (confirm('Are you sure you want to delete this train?')) {
      onTrainsChange(trains.filter(t => t.id !== id));
    }
  };

  return (
    <div className="train-manager">
      <h2>🚂 Train Manager</h2>

      <button
        className="btn btn-primary"
        onClick={() => setIsAdding(true)}
        disabled={isAdding}
      >
        Add New Train
      </button>

      {isAdding && (
        <div className="card">
          <h3>{editingId ? 'Edit Train' : 'Add New Train'}</h3>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="trainName">Train Name:</label>
              <input
                id="trainName"
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Express 1, Freight 2, Local 3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity:</label>
              <input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 10,
                  }))
                }
                placeholder="e.g., 10"
                min="1"
                required
              />
              <small>
                Capacity determines how much a train can carry or produce per
                trip
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="class">Class:</label>
              <select
                id="class"
                value={formData.class}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    class: e.target.value as TrainClass,
                  }))
                }
                required
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Train' : 'Add Train'}
              </button>
              <button type="button" onClick={resetForm} className="btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="trains-list">
        <h3>Current Trains</h3>
        <div className="trains-grid">
          {trains.map(train => (
            <div key={train.id} className="train-card">
              <div className="train-info">
                <h4>{train.name}</h4>
                <p>Capacity: {train.capacity}</p>
                <p>Available at: {train.availableAt}s</p>
              </div>

              <div className="train-actions">
                <button onClick={() => startEdit(train)} className="btn">
                  Edit
                </button>
                <button
                  onClick={() => deleteTrain(train.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
