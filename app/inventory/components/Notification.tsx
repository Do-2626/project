"use client"

import React from 'react';
import { NotificationState } from '@/app/inventory/types';

interface NotificationProps {
  notification: NotificationState | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg ${
        notification.type === "success" ? "bg-green-600" : "bg-red-600"
      } text-white z-50`}
    >
      {notification.message}
    </div>
  );
};

export default Notification;