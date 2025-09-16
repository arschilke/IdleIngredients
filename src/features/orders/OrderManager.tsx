import { OrderForm } from '../../components/forms/OrderForm';
import { Navbar } from '../../components/layout/Navbar';
import { useAddOrder, useOrders, useUpdateOrders } from '../../hooks/useOrders';
import { useResources } from '../../hooks/useResources';
import { Order } from '../../types';
import { CurrentOrders } from './CurrentOrders';

const OrderManager = () => {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: resources, isLoading: resourcesLoading } = useResources();
  const { mutate: updateOrders } = useUpdateOrders();
  const { mutate: addOrder } = useAddOrder();
  const handleOrderSubmit = (order: Order) => {
    addOrder(order);
  };
  const handleOrdersChange = (orders: Order[]) => {
    updateOrders(orders);
  };

  if (ordersLoading || resourcesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app order-manager">
      <Navbar />
      <div className="container-fluid">
        <h2>🚂 Order Manager</h2>
        <div className="row">
          <div className="col-6">
            <CurrentOrders
              resources={resources!}
              orders={orders!}
              onOrdersChange={handleOrdersChange}
            />
          </div>
          <div className="col-6 h-100">
            <OrderForm
              resources={resources!}
              onSubmit={handleOrderSubmit}
              onOrdersChange={handleOrdersChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
