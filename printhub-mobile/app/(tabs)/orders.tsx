import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { orderApi, Order } from '@/src/lib/api';
import { Colors } from '@/src/constants/Colors';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/authStore';
import { FileText, Calendar, Store, ChevronRight, Package } from 'lucide-react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }
      fetchOrders();
    }, [isAuthenticated])
  );

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getMyOrders(0);
      if (response.success && response.data) {
        setOrders(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/orders/${item.id}`)}>
      <View style={styles.orderIcon}>
        <FileText color={Colors.light.primary} size={24} />
      </View>
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.orderMeta}>
          <Store color={Colors.light.textSecondary} size={14} />
          <Text style={styles.shopName}>{item.shopName}</Text>
        </View>
        <View style={styles.orderMeta}>
          <Calendar color={Colors.light.textSecondary} size={14} />
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.orderItems}>{item.items.length} items</Text>
        </View>
      </View>
      <View style={styles.orderAmount}>
        <Text style={styles.amountText}>{formatCurrency(item.totalAmount)}</Text>
        <ChevronRight color={Colors.light.textSecondary} size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>{orders.length} orders</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Package color={Colors.light.textSecondary} size={48} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your print orders will appear here</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/upload')}>
            <Text style={styles.emptyButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  subtitle: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 4 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 8, textAlign: 'center' },
  emptyButton: {
    marginTop: 24,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 8 },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: { flex: 1 },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: { fontSize: 16, fontWeight: '600', color: Colors.light.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '500' },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  shopName: { marginLeft: 6, color: Colors.light.textSecondary, fontSize: 13 },
  orderDate: { marginLeft: 6, color: Colors.light.textSecondary, fontSize: 13 },
  orderItems: { marginLeft: 12, color: Colors.light.textSecondary, fontSize: 13 },
  orderAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginRight: 4 },
});
