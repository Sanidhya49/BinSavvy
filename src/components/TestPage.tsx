import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page - React is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestPage; 