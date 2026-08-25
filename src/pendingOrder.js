import { api } from './api';
import { getCustomerToken } from './authSession';

export const DEFAULT_CHECKOUT_CUSTOMER = {
  firstName: '', lastName: '', email: '', phone: '',
  address: 'Colombo', city: 'Colombo', country: 'Sri Lanka',
};

export async function loadCheckoutCustomer() {
  if (!getCustomerToken()) return DEFAULT_CHECKOUT_CUSTOMER;
  try {
    const data = await api.getProfile();
    const fullName = (data.full_name || data.username || '').trim();
    const [firstName = '', ...lastNameParts] = fullName.split(/\s+/);
    return {
      ...DEFAULT_CHECKOUT_CUSTOMER,
      firstName,
      lastName: lastNameParts.join(' '),
      email: data.email || '',
      phone: data.phone_number || '',
      address: data.address && data.address !== 'N/A' ? data.address : DEFAULT_CHECKOUT_CUSTOMER.address,
    };
  } catch (error) {
    console.error('Failed to load customer profile:', error);
    return DEFAULT_CHECKOUT_CUSTOMER;
  }
}

export function orderPreferenceKey(order) {
  return JSON.stringify({
    sizeId: order.sizeId || order.size?.id,
    frameId: order.frameId || order.frame?.id,
    people: order.people,
    deliveryMethod: order.deliveryMethod || 'courier',
    deliveryAddress: order.deliveryMethod === 'courier' ? order.deliveryAddress || null : null,
    urgent: order.urgent === true,
    urgentDeadline: order.urgent ? order.urgentDeadline : null,
    scheduled: order.scheduled === true,
    scheduledDate: order.scheduled ? order.scheduledDate : null,
    notes: order.notes || '',
  });
}

export async function createPendingPaymentOrder(order, customer, currency = 'LKR') {
  const result = await api.createPaymentOrder({
    currency,
    paymentMethod: 'card',
    order: {
      sizeId: order.sizeId || order.size?.id,
      frameId: order.frameId || order.frame?.id,
      people: order.people,
      deliveryMethod: order.deliveryMethod || 'courier',
      deliveryAddress: order.deliveryMethod === 'courier' ? order.deliveryAddress : null,
      urgent: order.urgent === true,
      urgentDeadline: order.urgent ? order.urgentDeadline : null,
      scheduled: order.scheduled === true,
      scheduledDate: order.scheduled ? order.scheduledDate : null,
      notes: order.notes || '',
    },
    customer: {
      ...customer,
      address: order.deliveryMethod === 'courier' && order.deliveryAddress
        ? order.deliveryAddress
        : customer.address,
    },
  });

  const commissionId = result.payment?.commissionId;
  if (!result.success || !commissionId) {
    throw new Error(result.error || 'Unable to save the pending order');
  }
  return {
    commissionId,
    orderId: result.payment.orderId,
    preferenceKey: orderPreferenceKey(order),
    referencePhotosUploaded: false,
  };
}
