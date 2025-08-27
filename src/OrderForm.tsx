import React, { useState } from 'react';
import { Order, Resource } from './types';

interface OrderFormProps {
  resources: Resource[];
  onSubmit: (order: Order) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ resources, onSubmit }) => {
  const [orderName, setOrderName] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [amount, setAmount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName || !selectedResource || amount <= 0) return;

    const order: Order = {
      id: Date.now().toString(),
      name: orderName,
      resourceId: selectedResource,
      amount: amount
    };

    onSubmit(order);
    
    // Reset form
    setOrderName('');
    setSelectedResource('');
    setAmount(1);
  };

  return (
    <div className="card">
      <h2>Create New Order</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="orderName">Order Name:</label>
          <input
            id="orderName"
            type="text"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            placeholder="Enter order name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="resource">Resource:</label>
          <select
            id="resource"
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
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
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Order
        </button>
      </form>
    </div>
  );
};
