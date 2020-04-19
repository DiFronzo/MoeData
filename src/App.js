import React from 'react';
import './App.css';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Album from './Album';
import Artist from './Artist';
import PageNotFound from "./PageNotFound";

function App() {
  return (
      <BrowserRouter>
          <Switch>
            <Route exact path="/album/:id" render={props => <Album {...props} />} />
            <Route exact path="/artist/:id" render={props => <Artist {...props} />} />
            <Route exact path="/404" component={PageNotFound} />
            <Route component={PageNotFound} />
          </Switch>
      </BrowserRouter>
  );
}

export default App;