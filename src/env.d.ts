// src/env.d.ts

interface Window {
    toast: (
      message: string, 
      type?: 'success' | 'error' | 'info' | 'warning'
    ) => void;
  }