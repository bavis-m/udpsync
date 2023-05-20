import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';

import 'graphiql/graphiql.css';
import { createBasePage } from './base_page';

const fetcher = createGraphiQLFetcher({ url: 'https://sync.mhack.io/graphql' });

createBasePage(
  <GraphiQL fetcher={fetcher} />,
  {maxWidth: false, sx:{}, style:{maxWidth:"80%"}}
);