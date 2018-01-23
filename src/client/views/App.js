import React from 'react';

import { Button } from './Button';

const displayName = 'App';
const defaultProps = {};
const propTypes = {};

const component = () => (
  <div>
    {'JSS SSR Example with simple button'}
    <br />
    <Button>{'Click Me!'}</Button>
  </div>
);

component.displayName = displayName;
component.defaultProps = defaultProps;
component.propTypes = propTypes;
export default component;
