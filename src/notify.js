import { toast } from 'react-toastify';
import Icon from './components/Icon';

const notificationIcon = (name, tone) => (
  <span className={`notification-status-icon notification-status-icon--${tone}`}>
    <Icon name={name} size={21}/>
  </span>
);

export const showNotification = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(message, { icon: notificationIcon('completed', 'success'), className: 'app-notification app-notification--success' });
      break;

    case 'error':
      toast.error(message, { icon: notificationIcon('alert', 'error'), className: 'app-notification app-notification--error' });
      break;

    case 'order_success':
      toast.success(message, { icon: notificationIcon('orders', 'success'), className: 'app-notification app-notification--success' });
      break;

    case 'status_update':
      toast.info(message, { icon: notificationIcon('pending', 'info'), className: 'app-notification app-notification--info' });
      break;

    case 'payment_success':
      toast.success(message, { icon: notificationIcon('payments', 'success'), className: 'app-notification app-notification--success' });
      break;

    default:
      toast(message, { icon: notificationIcon('bell', 'info'), className: 'app-notification app-notification--info' });
  }
};
