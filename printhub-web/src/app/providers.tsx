'use client';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A2740',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
