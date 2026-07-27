import { toast } from 'react-toastify';

export const showNotification = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(`🟢 ${message}`);
      break;

    case 'error':
      toast.error(`🔴 ${message}`);
      break;

    case 'order_success':
      toast.success(`🎉 SUCCESS: ${message}`, {
        icon: "🎨",
        style: { background: "#e6fffa", color: "#006d5b", fontWeight: "bold" }
      });
      break;

    case 'status_update':
      toast.info(`📅 UPDATE: ${message}`, {
        icon: "⏱️",
        style: { background: "#ebf8ff", color: "#2b6cb0" }
      });
      break;

    default:
      toast(message);
  }
};
