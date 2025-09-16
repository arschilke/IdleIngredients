import type { Order, BoatOrder, Resource } from '../../../types';
import { formatTime } from '../../../utils';
import React from 'react';

interface OrderListProps {
  orders: Order[];
  resources: Record<string, Resource>;
  onOrdersChange: (orders: Order[]) => void;
  onPlanProduction: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  resources,
  onOrdersChange,
  onPlanProduction,
}) => {
  if (orders.length === 0) {
    return (
      <div className="card flex-fill flex-shrink-1">
        <div className="card-header">
          <h2 className="h4 mb-0">Current Orders</h2>
        </div>
        <div className="card-body text-center">
          <p className="text-muted mb-0">
            No orders yet. Create your first order!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex-fill h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0">Current Orders</h2>
      </div>
      <div className="card-body">
        <div className="orders-grid">
          {orders.map(order => {
            return (
              <div key={order.id}>
                <div className="card bg-opacity-10 bg-light flex-shrink-0 shadow-sm">
                  <div className="card-header d-flex align-items-center">
                    <span className={`badge order-type-${order.type}`}>
                      {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    </span>
                    <h6 className="mb-0 ms-2">{order.name}</h6>
                    {/* Close (delete) button */}
                    <button
                      type="button"
                      className="btn-close align-self-start ms-auto"
                      aria-label="Delete order"
                      onClick={() => {
                        // Remove the order from the list
                        const updatedOrders = orders.filter(
                          o => o.id !== order.id
                        );
                        onOrdersChange(updatedOrders);
                      }}
                      style={{ zIndex: 2 }}
                    />
                  </div>

                  <div className="card-body">
                    {order.type === 'boat' && (
                      <p className="small text-warning mb-1">
                        <i className="bi bi-clock me-1"></i>
                        Expires in:{' '}
                        {formatTime((order as BoatOrder).expirationTime)}
                      </p>
                    )}
                    <div>
                      <small className="text-muted d-block mb-1">
                        Resources:
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {order.resources.map((req, index) => {
                          const resource = resources[req.resourceId];
                          return (
                            <span key={index} className="badge bg-secondary">
                              {resource?.name || req.resourceId}:{' '}
                              {req?.delivered || 0}/{req.amount}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => onPlanProduction(order)}
                  >
                    <i className="bi bi-gear me-1"></i>
                    Plan Production
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
