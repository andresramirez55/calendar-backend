import React from 'react';
import { EventProvider } from './contexts/EventContext';
import Layout from './components/Layout/Layout';
import MainApp from './components/MainApp/MainApp';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <EventProvider>
        <Layout>
          <MainApp />
        </Layout>
      </EventProvider>
    </ErrorBoundary>
  );
}

export default App;
