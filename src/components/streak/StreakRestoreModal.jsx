import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/lib/auth';
import { restoreStreak } from '@/services/streak/streakRestoreService';
import {
  hasFreeRestore as checkFreeRestore,
  useFreeRestore,
  incrementRestoreCount,
} from '@/services/storage/streakRestoreStorage';

const { width } = Dimensions.get('window');
const PRODUCT_ID = 'com.gymvy.streak_restore';

export function StreakRestoreModal({ visible, onClose, lostStreak = 0, missedDate, onRestored }) {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [freeRestoreAvailable, setFreeRestoreAvailable] = useState(false);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Check free restore availability and fetch product on mount
  useEffect(() => {
    if (!visible || !user?.id) return;

    const init = async () => {
      // Check free restore
      const hasFree = await checkFreeRestore(user.id);
      setFreeRestoreAvailable(hasFree);

      // Fetch consumable product (only if no free restore)
      if (!hasFree) {
        setIsLoadingProduct(true);
        try {
          const products = await Purchases.getProducts([PRODUCT_ID]);
          if (products.length > 0) {
            setProduct(products[0]);
          }
        } catch (error) {
          console.error('[StreakRestore] Error fetching product:', error);
        } finally {
          setIsLoadingProduct(false);
        }
      }
    };

    init();
  }, [visible, user?.id]);

  const handleRestore = async (isFree) => {
    if (!user?.id || !missedDate || isLoading) return;

    setIsLoading(true);
    try {
      if (!isFree) {
        // Purchase via RevenueCat
        if (!product) {
          Alert.alert('Error', 'Unable to load purchase. Please try again.');
          setIsLoading(false);
          return;
        }

        const purchaseResult = await Purchases.purchaseStoreProduct(product);
        if (!purchaseResult) {
          setIsLoading(false);
          return;
        }
      }

      // Insert unplanned_rest for the missed date
      const success = await restoreStreak(user.id, missedDate);

      if (!success) {
        Alert.alert('Error', 'Failed to restore streak. Please try again.');
        setIsLoading(false);
        return;
      }

      // Track the restore
      if (isFree) {
        await useFreeRestore(user.id);
      } else {
        await incrementRestoreCount(user.id);
      }

      // Notify parent
      if (onRestored) {
        onRestored();
      }

      onClose();
    } catch (error) {
      // User cancelled purchase
      if (error.userCancelled) {
        setIsLoading(false);
        return;
      }

      console.error('[StreakRestore] Error during restore:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const price = product?.priceString || '$0.99';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay} tint="dark">
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
          {/* Decorative gradient top */}
          <LinearGradient
            colors={['rgba(248, 113, 113, 0.15)', 'transparent']}
            style={styles.topGradient}
          />

          {/* Fire emoji with glow effect */}
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow} />
            <Text style={styles.icon}>🔥</Text>
            <View style={[styles.brokenIndicator, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Streak Lost
          </Text>

          {/* Streak count */}
          <View style={styles.streakCountContainer}>
            <Text style={[styles.streakNumber, { color: colors.text }]}>
              {lostStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.secondaryText }]}>
              day streak ended
            </Text>
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: colors.secondaryText }]}>
            You missed a workout yesterday.{'\n'}
            Don't let your hard work go to waste!
          </Text>

          {/* Paid Restore Button */}
          {!freeRestoreAvailable && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.restoreButton}
              onPress={() => handleRestore(false)}
              disabled={isLoading || isLoadingProduct}
            >
              <LinearGradient
                colors={['#818CF8', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.restoreButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={styles.restoreButtonContent}>
                    <View style={styles.restoreButtonLeft}>
                      <Ionicons name="flame" size={24} color="#fff" />
                      <View>
                        <Text style={styles.restoreButtonTitle}>
                          Restore My Streak
                        </Text>
                        <Text style={styles.restoreButtonSubtitle}>
                          Get back to {lostStreak} days
                        </Text>
                      </View>
                    </View>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>
                        {isLoadingProduct ? '...' : price}
                      </Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Free restore option */}
          {freeRestoreAvailable && (
            <TouchableOpacity
              style={styles.freeRestoreButton}
              onPress={() => handleRestore(true)}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']}
                style={styles.freeRestoreGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#34D399" />
                ) : (
                  <>
                    <Ionicons name="gift" size={20} color="#34D399" />
                    <Text style={styles.freeRestoreText}>
                      Use Free Restore
                    </Text>
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeBadgeText}>1 LEFT</Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Dismiss option */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={[styles.dismissText, { color: colors.secondaryText }]}>
              Start over from 0 days
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width - 48,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
    marginTop: 8,
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    top: -10,
    left: -10,
  },
  icon: {
    fontSize: 60,
  },
  brokenIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    borderRadius: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  streakCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  restoreButton: {
    width: '100%',
    marginBottom: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  restoreButtonGradient: {
    borderRadius: 16,
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  restoreButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restoreButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restoreButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  restoreButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  freeRestoreButton: {
    width: '100%',
    marginBottom: 12,
  },
  freeRestoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    minHeight: 48,
  },
  freeRestoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34D399',
  },
  freeBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StreakRestoreModal;
