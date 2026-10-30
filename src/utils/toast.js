import { toast as hotToast } from "react-hot-toast";

export const toast = {
  success: (message) => {
    return hotToast.success(message, {
      style: {
        background: "#ffffff",
        color: "#FF6F00",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderLeft: "5px solid #FF6F00",
      },
      position: "top-right",
      duration: 2000, // faster and smoother
      iconTheme: {
        primary: "#FF6F00",
        secondary: "#ffffff",
      },
    });
  },

  error: (message) => {
    return hotToast.error(message, {
      style: {
        background: "#ffffff",
        color: "#B91C1C",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderLeft: "5px solid #B91C1C",
      },
      position: "top-right",
      duration: 2000,
      iconTheme: {
        primary: "#B91C1C",
        secondary: "#ffffff",
      },
    });
  },
};

export default toast;
