export const ROLES = {
  DERA: 'dera',
  DVM: 'dvm',
  CONSUMER: 'consumer',
}

export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
}

export const SERVICE_STATUS = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  BOOKED: 'booked',
  COMPLETED: 'completed',
}

export const LIVESTOCK_STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  AVAILABLE: 'available',
  SOLD_OUT: 'sold-out',
  PURCHASED: 'purchased',
  REQUESTED: 'requested',
}

export const NOTIFICATION_TYPES = {
  SERVICE_AVAILMENT: 'service-availment',
  SERVICE_ACCEPTED: 'service-accepted',
  SERVICE_CANCELLED: 'service-cancelled',
  SERVICE_COMPLETED: 'service-completed',
  DAIRY_ORDER_PLACED: 'dairy-order-placed',
  DAIRY_ORDER_CONFIRMED: 'dairy-order-confirmed',
  DAIRY_ORDER_REJECTED: 'dairy-order-rejected',
  DAIRY_ORDER_CANCELLED: 'dairy-order-cancelled',
  DAIRY_ORDER_DELIVERED: 'dairy-order-delivered',
  DAIRY_PRODUCT_SUBSCRIPTION_REQUEST: 'dairy-product-subscription-request',
  DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED: 'dairy-product-subscription-accepted',
  DAIRY_PRODUCT_SUBSCRIPTION_REJECTED: 'dairy-product-subscription-rejected',
  DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED: 'dairy-product-subscription-cancelled',
  DAIRY_PRODUCT_SUBSCRIPTION_DELIVERED: 'dairy-product-subscription-delivered',
  LIVESTOCK_SOLD_OUT: 'livestock-sold-out',
  ADMIN_NOTIFICATION: 'admin-notification',
  LIVESTOCK_REJECTED: 'livestock-rejected',
}

export const DAIRY_PRODUCT_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
}

export const DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  ACTIVE: 'active',
  DELIVERED: 'delivered',
}

export const SERVER_URL = 'https://dera-fyp.cyclic.app/api/v1'