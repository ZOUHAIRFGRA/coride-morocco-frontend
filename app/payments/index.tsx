// Payment Management Screen
// Phase 7: View payments, confirm, and manage disputes

import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { paymentApiService } from '@/services/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import type { Payment, PaymentStatus } from '@/types/payment';

type TabType = 'all' | 'pending' | 'completed' | 'disputed';

export default function PaymentsScreen() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  /**
   * Fetch payments based on active tab
   */
  const fetchPayments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let response;

      switch (activeTab) {
        case 'pending':
          response = await paymentApiService.getPendingPayments();
          break;
        case 'disputed':
          response = await paymentApiService.getDisputedPayments();
          break;
        case 'completed':
          response = await paymentApiService.getPayments({ status: 'completed' });
          break;
        default:
          response = await paymentApiService.getRecentPayments();
      }

      if (response.success && response.data) {
        setPayments(response.data.payments);
      } else {
        setPayments([]);
        setLoadError(response.error?.message || 'Failed to load payments');
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
      setLoadError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Refresh payments
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };
  
  /**
   * Confirm a payment
   */
  const handleConfirmPayment = async (payment: Payment) => {
    Alert.alert(
      'Confirm Payment',
      `Confirm payment of ${payment.amount} MAD for this ride?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await paymentApiService.confirmAsRider(payment.id);
              if (response.success) {
                Alert.alert('Success', 'Payment confirmed');
                fetchPayments();
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to confirm payment');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm payment');
            }
          },
        },
      ]
    );
  };
  
  /**
   * Report an issue with a payment — no dedicated dispute flow exists yet
   */
  const handleOpenDispute = (_payment: Payment) => {
    Alert.alert(
      'Report an issue',
      'Payment disputes aren\'t handled in the app yet. Please contact support with this payment\'s reference number.'
    );
  };
  
  return (
    <View className="flex-1 bg-background">
      {/* Tabs */}
      <View className="flex-row border-b border-border">
        <TabButton
          title="All"
          active={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
        />
        <TabButton
          title="Pending"
          active={activeTab === 'pending'}
          onPress={() => setActiveTab('pending')}
        />
        <TabButton
          title="Completed"
          active={activeTab === 'completed'}
          onPress={() => setActiveTab('completed')}
        />
        <TabButton
          title="Disputed"
          active={activeTab === 'disputed'}
          onPress={() => setActiveTab('disputed')}
        />
      </View>
      
      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" />
            </View>
          ) : loadError ? (
            <View className="items-center py-8">
              <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
              <Text className="text-md text-muted-foreground mt-4">{loadError}</Text>
              <TouchableOpacity onPress={fetchPayments} className="mt-4">
                <Text className="text-blue-500">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : payments.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
              <Text className="text-md text-muted-foreground mt-4">
                No payments found
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onConfirm={handleConfirmPayment}
                  onDispute={handleOpenDispute}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View className="absolute bottom-4 right-4 space-y-2">
        <TouchableOpacity
          onPress={() => router.push('/payments/calculator')}
          className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="calculator" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/payments/savings')}
          className="bg-green-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="trending-down" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Tab button component
 */
function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 items-center border-b-2 ${
        active ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          active ? 'text-blue-500' : 'text-muted-foreground'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Payment card component
 */
function PaymentCard({
  payment,
  onConfirm,
  onDispute,
}: {
  payment: Payment;
  onConfirm: (payment: Payment) => void;
  onDispute: (payment: Payment) => void;
}) {
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'disputed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };
  
  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'disputed':
        return 'warning';
      default:
        return 'help-circle';
    }
  };
  
  return (
    <View className="p-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">
            {payment.amount.toFixed(2)} MAD
          </Text>
          <Text className="text-sm text-muted-foreground">
            {new Date(payment.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons
            name={getStatusIcon(payment.status)}
            size={16}
            className={getStatusColor(payment.status)}
          />
          <Text className={`text-sm ml-1 ${getStatusColor(payment.status)}`}>
            {payment.status}
          </Text>
        </View>
      </View>
      
      {/* Payment Details */}
      <View className="mb-3">
        <View className="flex-row justify-between py-1">
          <Text className="text-sm text-muted-foreground">Method</Text>
          <Text className="text-sm text-foreground">{payment.payment_method}</Text>
        </View>
      </View>

      {/* Confirmation Status */}
      {payment.status === 'pending' && (
        <View className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <Text className="text-xs text-yellow-700 dark:text-yellow-300">
            Waiting for confirmation
          </Text>
          {!payment.confirmed_by_driver && (
            <Text className="text-xs text-muted-foreground">• Driver confirmation pending</Text>
          )}
          {!payment.confirmed_by_rider && (
            <Text className="text-xs text-muted-foreground">• Your confirmation pending</Text>
          )}
        </View>
      )}

      {/* Actions */}
      {payment.status === 'pending' && !payment.confirmed_by_rider && (
        <View className="flex-row gap-2">
          <Button
            onPress={() => onConfirm(payment)}
            variant="outline"
            className="flex-1"
          >
            <ButtonText>Confirm</ButtonText>
          </Button>
          <Button
            onPress={() => onDispute(payment)}
            variant="outline"
            className="flex-1"
          >
            <ButtonText>Dispute</ButtonText>
          </Button>
        </View>
      )}
      
      {payment.status === 'completed' && (
        <TouchableOpacity
          onPress={() => onDispute(payment)}
          className="items-center py-2"
        >
          <Text className="text-sm text-blue-500">Report an issue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
