"use client";

import React, { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import Alert from '@/components/ui/alert/Alert';

// Initial Alert State
const initialState = {
  alerts: []
};

// Alert Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, {
          ...action.payload,
          id: Date.now() + Math.random().toString(36).substr(2, 9)
        }]
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };
    case 'CLEAR_ALERTS':
      return {
        ...state,
        alerts: []
      };
    default:
      return state;
  }
};

// Create Alert Context
export const AlertContext = createContext();

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  const [windowHeight, setWindowHeight] = useState(0);

  // Handle window resize to adjust alert positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    // Set initial height
    setWindowHeight(window.innerHeight);

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Predefined Alert Types
  const alertTypes = {
    SUCCESS: (message, title = 'Success', duration = 2000) => ({
      variant: 'success',
      title,
      message,
      duration
    }),
    ERROR: (message, title = 'Error', duration = 5000) => ({
      variant: 'error',
      title,
      message,
      duration
    }),
    WARNING: (message, title = 'Warning', duration = 3000) => ({
      variant: 'warning',
      title,
      message,
      duration
    }),
    INFO: (message, title = 'Information', duration = 2000) => ({
      variant: 'info',
      title,
      message,
      duration
    })
  };

  // Show Alert Method
  const showAlert = useCallback((message, alertConfig) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    const alertPayload = typeof alertConfig === 'function' 
      ? alertConfig(message) 
      : { 
          variant: 'info', 
          title: 'Notification', 
          message, 
          duration: 3000, 
          ...alertConfig 
        };

    dispatch({ 
      type: 'ADD_ALERT', 
      payload: { ...alertPayload, id } 
    });

    return id;
  }, []);

  // Clear Alerts Method
  const clearAlerts = useCallback(() => {
    dispatch({ type: 'CLEAR_ALERTS' });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, clearAlerts, alertTypes }}>
      {children}
      <div 
        className="fixed inset-x-0 top-8 flex justify-center z-100 pointer-events-none"
      >
        <div className="w-full max-w-sm space-y-2">
          {state.alerts.map((alert) => (
            <AutoDismissAlert 
              key={alert.id}
              {...alert}
              onClose={() => dispatch({ type: 'REMOVE_ALERT', payload: alert.id })}
            />
          ))}
        </div>
      </div>
    </AlertContext.Provider>
  );
};

// Auto-dismiss Alert Wrapper Component
const AutoDismissAlert = ({ onClose, duration = 2000, ...alertProps }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <Alert 
      {...alertProps}
      className="pointer-events-auto transition-all duration-500 ease-in-out transform origin-top animate-slide-in-down"
    />
  );
};

// Custom Hook for Using Alerts
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertProvider;