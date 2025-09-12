import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '../types';
import {
  saveOrdersToStorage,
  loadOrdersFromStorage,
} from '../lib/localStorageUtils';
import { ensureLocalStorageData } from '../lib/migrateData';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  id: (id: string) => [...orderKeys.all, id] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: string) => [...orderKeys.lists(), { filters }] as const,
};

// Fetch orders from localStorage
const fetchOrders = async (): Promise<Order[]> => {
  return loadOrdersFromStorage();
};

// Save orders to localStorage
const saveOrders = async (orders: Order[]): Promise<Order[]> => {
  saveOrdersToStorage(orders);
  return orders;
};

// Hook to get orders
export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook to add a new order
export const useAddOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: Order) => {
      const currentOrders =
        queryClient.getQueryData<Order[]>(orderKeys.lists()) || [];
      const updatedOrders = [...currentOrders, newOrder];
      return saveOrders(updatedOrders);
    },
    onSuccess: updatedOrders => {
      queryClient.setQueryData(orderKeys.lists(), updatedOrders);
    },
  });
};

// Hook to update orders
export const useUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders: Order[]) => {
      return saveOrders(orders);
    },
    onSuccess: updatedOrders => {
      queryClient.setQueryData(orderKeys.lists(), updatedOrders);
    },
  });
};

// Hook to remove an order
export const useRemoveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const currentOrders =
        queryClient.getQueryData<Order[]>(orderKeys.lists()) || [];
      const updatedOrders = currentOrders.filter(order => order.id !== orderId);
      return saveOrders(updatedOrders);
    },
    onSuccess: updatedOrders => {
      queryClient.setQueryData(orderKeys.lists(), updatedOrders);
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.id(orderId),
    queryFn: async () => {
      await ensureLocalStorageData();
      const orders = await fetchOrders();
      return orders.find(order => order.id === orderId);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
