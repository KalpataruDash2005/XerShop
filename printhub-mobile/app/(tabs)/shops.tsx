import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { shopApi, Shop } from '@/src/lib/api';
import { Colors } from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import { MapPin, Star, Store, Navigation } from 'lucide-react-native';

export default function ShopsScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchShops();
    }
  }, [location]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby shops');
        setIsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchShops = async () => {
    if (!location) return;

    try {
      const response = await shopApi.getNearby(
        location.coords.latitude,
        location.coords.longitude,
        10
      );
      if (response.success && response.data) {
        setShops(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableOpacity style={styles.shopCard} onPress={() => router.push(`/shops/${item.id}`)}>
      <View style={styles.shopLogo}>
        {item.logoUrl ? (
          <View style={styles.shopLogoPlaceholder}>
            <Store color={Colors.light.primary} size={32} />
          </View>
        ) : (
          <View style={styles.shopLogoPlaceholder}>
            <Store color={Colors.light.primary} size={32} />
          </View>
        )}
      </View>
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopName}>{item.name}</Text>
          {item.distanceKm && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{item.distanceKm.toFixed(1)} km</Text>
            </View>
          )}
        </View>
        <View style={styles.shopLocation}>
          <MapPin color={Colors.light.textSecondary} size={14} />
          <Text style={styles.shopCity}>{item.city}, {item.state}</Text>
        </View>
        <View style={styles.shopFooter}>
          <View style={styles.rating}>
            <Star color="#F59E0B" size={16} fill="#F59E0B" />
            <Text style={styles.ratingText}>{item.ratingAvg.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.totalReviews})</Text>
          </View>
          {!item.isAcceptingOrders && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Print Shops</Text>
        {location && (
          <View style={styles.locationInfo}>
            <Navigation color={Colors.light.primary} size={16} />
            <Text style={styles.locationText}>Using your location</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Finding shops near you...</Text>
        </View>
      ) : shops.length === 0 ? (
        <View style={styles.empty}>
          <Store color={Colors.light.textSecondary} size={48} />
          <Text style={styles.emptyTitle}>No shops found</Text>
          <Text style={styles.emptyText}>Try expanding your search area</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderShop}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 6,
    color: Colors.light.primary,
    fontSize: 14,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.light.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 8, textAlign: 'center' },
  list: { padding: 16, paddingTop: 8 },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shopLogo: { marginRight: 12 },
  shopLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: { flex: 1 },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopName: { fontSize: 16, fontWeight: '600', color: Colors.light.text, flex: 1 },
  distanceBadge: {
    backgroundColor: Colors.light.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: { fontSize: 12, color: Colors.light.text },
  shopLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  shopCity: { marginLeft: 4, color: Colors.light.textSecondary, fontSize: 13 },
  shopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontWeight: '500', color: Colors.light.text },
  reviewCount: { marginLeft: 4, color: Colors.light.textSecondary, fontSize: 12 },
  closedBadge: {
    marginLeft: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closedText: { fontSize: 12, color: '#D97706' },
});
