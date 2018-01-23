import React from 'react';

import App from './views/App';

const displayName = 'RootComponent';
const component = () => <App />;

component.displayName = displayName;
export default component;
