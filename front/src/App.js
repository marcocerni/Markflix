import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navigation from './components/Navigation'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import MovieDetail from './components/MovieDetail'
import MoviePlay from './components/MoviePlay'
import Search from './components/Search'

import './App.css';

require('dotenv').config();

function App() {
  return (
      <Router>
        <Navigation />
        <div className="container p-4">
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/movie-detail/:id" component={MovieDetail} />
          <Route path="/play/:id" component={MoviePlay} />
          <Route path="/search" component={Search} />
        </div>
      </Router>
  );
}

export default App;