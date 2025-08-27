import React, { useState } from 'react';
import { Worker } from './types';

interface WorkerManagerProps {
  workers: Worker[];
  onWorkersChange: (workers: Worker[]) => void;
}

export const WorkerManager: React.FC<WorkerManagerProps> = ({ workers, onWorkersChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10
  });

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 10
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please fill in the worker name.');
      return;
    }

    const worker: Worker = {
      id: editingId || `worker_${Date.now()}`,
      name: formData.name.trim(),
      capacity: formData.capacity,
      availableAt: 0
    };

    if (editingId) {
      onWorkersChange(workers.map(w => w.id === editingId ? worker : w));
    } else {
      onWorkersChange([...workers, worker]);
    }

    resetForm();
  };

  const startEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      capacity: worker.capacity
    });
    setEditingId(worker.id);
    setIsAdding(true);
  };

  const deleteWorker = (id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      onWorkersChange(workers.filter(w => w.id !== id));
    }
  };

  return (
    <div className="worker-manager">
      <h2>👥 Worker Manager</h2>
      
      <button 
        className="btn btn-primary"
        onClick={() => setIsAdding(true)}
        disabled={isAdding}
      >
        Add New Worker
      </button>

      {isAdding && (
        <div className="card">
          <h3>{editingId ? 'Edit Worker' : 'Add New Worker'}</h3>
          
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="workerName">Worker Name:</label>
              <input
                id="workerName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Alice, Bob, Charlie"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity:</label>
              <input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                placeholder="e.g., 10"
                min="1"
                required
              />
              <small>Capacity determines how much a worker can carry or produce per trip</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Worker' : 'Add Worker'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="workers-list">
        <h3>Current Workers</h3>
        <div className="workers-grid">
          {workers.map(worker => (
            <div key={worker.id} className="worker-card">
              <div className="worker-info">
                <h4>{worker.name}</h4>
                <p>Capacity: {worker.capacity}</p>
                <p>Available at: {worker.availableAt}s</p>
              </div>
              
              <div className="worker-actions">
                <button
                  onClick={() => startEdit(worker)}
                  className="btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteWorker(worker.id)}
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
