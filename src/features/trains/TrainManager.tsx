import { useState } from 'react';
import { Country, type Train, TrainClass } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import {
  useAddTrain,
  useRemoveTrain,
  useTrains,
  useUpdateTrain,
} from '../../hooks/useTrains';
import { TrainForm } from '../../components/forms/TrainForm';

export const TrainManager = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: trains = {}, isLoading: trainsLoading } = useTrains();

  const { mutate: addTrain } = useAddTrain();
  const { mutate: updateTrain } = useUpdateTrain();
  const { mutate: removeTrain } = useRemoveTrain();

  if (trainsLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (train: Train) => {
    if (editingId) {
      updateTrain(train);
    } else {
      addTrain(train);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (train: Train) => {
    setEditingId(train.id);
    setIsAdding(true);
  };

  const deleteTrain = (id: string) => {
    if (confirm('Are you sure you want to delete this train?')) {
      removeTrain(id);
    }
  };

  const getTrainClassColor = (trainClass: TrainClass): string => {
    switch (trainClass) {
      case TrainClass.Common:
        return '';
      case TrainClass.Rare:
        return 'bg-primary';
      case TrainClass.Epic:
        return 'bg-secondary';
      case TrainClass.Legendary:
        return 'bg-warning';
    }
  };

  return (
    <div className="train-manager">
      <Navbar />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <h2>🚂 Train Manager</h2>

          <button
            title="Add New Train"
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>

        {isAdding && (
          <TrainForm
            train={editingId ? trains[editingId] : undefined}
            onSubmit={handleSubmit}
            onClose={() => {
              setIsAdding(false);
              setEditingId(null);
            }}
          />
        )}

        <div className="trains-list">
          <div className="row">
            {Object.values(Country).map(country => (
              <div className="col" key={country}>
                <h4>{country.toLocaleUpperCase()}</h4>
                <div className="row row-cols-auto row-cols-md-2 g-2">
                  {Object.values(trains)
                    .filter(train => train.country === country)
                    .map(train => (
                      <div className="col" key={train.id}>
                        <div
                          className={`train-card card bg-opacity-25 ${getTrainClassColor(train.class)}`}
                        >
                          <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                              <h4 className="me-2">{train.name}</h4>
                              <div className="d-flex flex-column ms-auto train-actions">
                                <button
                                  title="Edit Train"
                                  onClick={() => startEdit(train)}
                                  className=" btn btn-outline-primary btn-sm"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  title="Delete Train"
                                  onClick={() => deleteTrain(train.id)}
                                  className="btn btn-outline-danger btn-sm"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="train-info">
                              <p>Capacity: {train.capacity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainManager;
