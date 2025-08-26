
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
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { units, categories, unitsOfMeasure, suppliers, ingredients, dishes, orders, users, menuCycle, rationScaleItems, regions } from '@/lib/data';


export default function CheckStatusPage() {
  const [writeStatus, setWriteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [readStatus, setReadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleWriteTest = async () => {
    setWriteStatus('loading');
    setReadStatus('idle');
    setSeedStatus('idle');
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
    setWriteStatus('idle');
    setSeedStatus('idle');
    setErrorMessage('');
    try {
      const testDocRef = doc(collection(firestore, 'status-checks'), 'write-test');
      const docSnap = await getDoc(testDocRef);
      
      if (!docSnap.exists()) {
        setReadStatus('error');
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

  const handleSeedDatabase = async () => {
    setSeedStatus('loading');
    setWriteStatus('idle');
    setReadStatus('idle');
    setErrorMessage('');
    try {
        const batch = writeBatch(firestore);

        regions.forEach(item => {
            const docRef = doc(collection(firestore, 'regions'), item.id);
            batch.set(docRef, item);
        });

        units.forEach(item => {
            const docRef = doc(collection(firestore, 'units'), item.id);
            batch.set(docRef, item);
        });
        
        categories.forEach(item => {
            const docRef = doc(collection(firestore, 'categories'), item.id);
            batch.set(docRef, item);
        });

        unitsOfMeasure.forEach(item => {
            const docRef = doc(collection(firestore, 'unitsOfMeasure'), item.id);
            batch.set(docRef, item);
        });
        
        suppliers.forEach(item => {
            const docRef = doc(collection(firestore, 'suppliers'), item.id);
            batch.set(docRef, item);
        });
        
        ingredients.forEach(item => {
            const docRef = doc(collection(firestore, 'ingredients'), item.id);
            batch.set(docRef, item);
        });
        
        rationScaleItems.forEach(item => {
            const docRef = doc(collection(firestore, 'rationScaleItems'), item.id);
            batch.set(docRef, item);
        });

        dishes.forEach(item => {
            const docRef = doc(collection(firestore, 'dishes'), item.id);
            batch.set(docRef, item);
        });

        orders.forEach(item => {
            const docRef = doc(collection(firestore, 'orders'), item.id);
            batch.set(docRef, item);
        });

        users.forEach(item => {
            const docRef = doc(collection(firestore, 'users'), item.id);
            batch.set(docRef, item);
        });

        menuCycle.forEach(item => {
            const docRef = doc(collection(firestore, 'menuCycle'), String(item.day));
            batch.set(docRef, item);
        });

        await batch.commit();
        setSeedStatus('success');
    } catch (error: any) {
        setSeedStatus('error');
        setErrorMessage(error.message || 'An unknown error occurred during database seeding.');
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
        <CardTitle>Firestore Connection & Data</CardTitle>
        <CardDescription>
          Use these tools to verify the connection to your Firestore database and to seed it with initial data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Write Test</h3>
            <p className="text-sm text-muted-foreground">
              Attempts to write a single document to the 'status-checks' collection.
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

        <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Database /> Seed Database</h3>
            <p className="text-sm text-muted-foreground">
              Populates your database with the initial placeholder data for units, categories, ingredients, etc.
            </p>
          </div>
          <div className="flex items-center gap-4">
             {getStatusIcon(seedStatus)}
            <Button onClick={handleSeedDatabase} disabled={seedStatus === 'loading'} variant="secondary">
              {seedStatus === 'loading' ? 'Seeding...' : 'Seed Database'}
            </Button>
          </div>
        </div>

        {(writeStatus === 'error' || readStatus === 'error' || seedStatus === 'error') && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Operation Failed</AlertTitle>
                <AlertDescription>
                    {errorMessage}
                </AlertDescription>
            </Alert>
        )}
         {(writeStatus === 'success' || readStatus === 'success' || seedStatus === 'success') && (
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-300">Operation Succeeded</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                    The requested Firestore operation was successful.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
