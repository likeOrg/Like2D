import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <img 
        src="/logo.svg" 
        alt="Like2D Logo" 
        style={{ maxWidth: '200px', marginBottom: '20px' }}
      />
      <h1>Like2D</h1>
      <p>A web-native game framework inspired by Love2D</p>
    </div>
  );
};

export default App;
