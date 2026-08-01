import { toast } from 'react-toastify';
import Icon from '../components/Icon';

const notificationIcon = (name, tone) => (
  <span className={`notification-status-icon notification-status-icon--${tone}`}>
    <Icon name={name} size={21}/>
  </span>
);

const options = {
  success: { icon: notificationIcon('completed', 'success'), className: 'app-notification app-notification--success' },
  error: { icon: notificationIcon('alert', 'error'), className: 'app-notification app-notification--error' },
  order: { icon: notificationIcon('orders', 'success'), className: 'app-notification app-notification--success' },
  update: { icon: notificationIcon('pending', 'info'), className: 'app-notification app-notification--info' },
  payment: { icon: notificationIcon('payments', 'success'), className: 'app-notification app-notification--success' },
};

export const showNotification = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(message, options.success);
      break;

    case 'error':
      toast.error(message, options.error);
      break;

    case 'order_success':
      toast.success(message, options.order);
      break;

    case 'status_update':
      toast.info(message, options.update);
      break;

    case 'payment_success':
      toast.success(message, options.payment);
      break;

    default:
      toast(message, { icon: notificationIcon('bell', 'info'), className: 'app-notification app-notification--info' });
  }
};

window.showNotification = showNotification;
