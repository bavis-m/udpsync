import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import { render } from 'react-dom';

import 'graphiql/graphiql.css';

const fetcher = createGraphiQLFetcher({ url: 'https://sync.mhack.io/graphql' });

render(
  <GraphiQL fetcher={fetcher} />,
  document.getElementById('root'),
);