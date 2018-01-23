import React from 'react';
import { hydrate } from 'react-dom';

const hotReRender = ({ firstRender } = { firstRender: false }) => {
  import('./RootComponent').then(module => {
    const RootComponent = module.default;
    hydrate(<RootComponent />, document.querySelector('[data-jshook~="app-body"]'), () => {
      if (firstRender) {
        // Remove server-generated styles after first render
        const ssStyles = document.querySelector('[data-jshook~="server-side-styles"]');
        ssStyles.parentNode.removeChild(ssStyles);
      }
    });
  });
};

hotReRender({ firstRender: true });

if (module.hot) {
  module.hot.accept('./RootComponent', () => setTimeout(hotReRender));
}
