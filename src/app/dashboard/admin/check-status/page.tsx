
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
import { firestore } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';


export default function CheckStatusPage() {
  const [writeStatus, setWriteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [readStatus, setReadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleWriteTest = async () => {
    setWriteStatus('loading');
    setErrorMessage('');
    try {
      const testDocRef = doc(collection(firestore, 'status-checks'), 'write-test');
      const testDoc = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      await setDoc(testDocRef, testDoc);
      setWriteStatus('success');
    } catch (error: any) {
      setWriteStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred during write test.');
      console.error(error);
    }
  };

  const handleReadTest = async () => {
    setReadStatus('loading');
    setErrorMessage('');
    try {
      const testDocRef = doc(collection(firestore, 'status-checks'), 'write-test');
      const docSnap = await getDoc(testDocRef);
      
      if (!docSnap.exists()) {
        throw new Error('Test document does not exist. Please run the write test first.');
      }
      console.log('Read data:', docSnap.data());
      setReadStatus('success');
    } catch (error: any) {
      setReadStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred during read test.');
      console.error(error);
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
