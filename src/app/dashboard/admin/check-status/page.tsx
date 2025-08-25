
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// A mock firestore client for demonstration.
// In a real app, this would be properly initialized.
const mockFirestore = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {
        console.log(`Firestore Write to ${name}/${id}:`, data);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate a failure 10% of the time for testing
        if (Math.random() < 0.1) {
          throw new Error('Simulated Firestore write error.');
        }
        return Promise.resolve();
      },
      get: async () => {
        console.log(`Firestore Read from ${name}/${id}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
         // Simulate a failure 10% of the time for testing
         if (Math.random() < 0.1) {
          throw new Error('Simulated Firestore read error.');
        }
        return Promise.resolve({
            exists: () => true,
            data: () => ({
                message: 'Hello from Firestore!',
                timestamp: new Date(),
            }),
        });
      },
    }),
  }),
};


export default function CheckStatusPage() {
  const [writeStatus, setWriteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [readStatus, setReadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleWriteTest = async () => {
    setWriteStatus('loading');
    setErrorMessage('');
    try {
      const testDoc = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      // This is where you would call your actual firestore instance
      await mockFirestore.collection('status-checks').doc('write-test').set(testDoc);
      setWriteStatus('success');
    } catch (error: any) {
      setWriteStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred during write test.');
    }
  };

  const handleReadTest = async () => {
    setReadStatus('loading');
    setErrorMessage('');
    try {
        // This is where you would call your actual firestore instance
      const doc = await mockFirestore.collection('status-checks').doc('write-test').get();
      if (!doc.exists()) {
        throw new Error('Test document does not exist. Please run the write test first.');
      }
      console.log('Read data:', doc.data());
      setReadStatus('success');
    } catch (error: any) {
      setReadStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred during read test.');
    }
  };

  const getStatusIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firestore Connection Status</CardTitle>
        <CardDescription>
          Use these tests to verify the connection to your Firestore database.
          Ensure your security rules are configured correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Write Test</h3>
            <p className="text-sm text-muted-foreground">
              Attempts to write a small document to the 'status-checks' collection.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusIcon(writeStatus)}
            <Button onClick={handleWriteTest} disabled={writeStatus === 'loading'}>
              Run Write Test
            </Button>
          </div>
        </div>

         <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Read Test</h3>
            <p className="text-sm text-muted-foreground">
              Attempts to read the document created by the write test.
            </p>
          </div>
          <div className="flex items-center gap-4">
             {getStatusIcon(readStatus)}
            <Button onClick={handleReadTest} disabled={readStatus === 'loading'}>
              Run Read Test
            </Button>
          </div>
        </div>

        {(writeStatus === 'error' || readStatus === 'error') && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Test Failed</AlertTitle>
                <AlertDescription>
                    {errorMessage}
                </AlertDescription>
            </Alert>
        )}
         {(writeStatus === 'success' || readStatus === 'success') && (
            <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Test Succeeded</AlertTitle>
                <AlertDescription className="text-green-700">
                    The operation was successful.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
