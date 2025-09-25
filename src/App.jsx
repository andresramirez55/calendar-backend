import React from 'react';
import { EventProvider } from './contexts/EventContext';
import Layout from './components/Layout/Layout';
import Calendar from './components/Calendar/Calendar';

function App() {
  return (
    <EventProvider>
      <Layout>
        <Calendar />
      </Layout>
    </EventProvider>
  );
}

export default App;
