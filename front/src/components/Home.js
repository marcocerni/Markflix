import React, { Component } from 'react'
import axios from 'axios'
import './Home.css';
import { Link } from 'react-router-dom'

require('dotenv').config();

export default class Home extends Component {

    state = {
        movies: []
    };

    async componentDidMount() {
        this.getTrendingMovies();
    }

    getTrendingMovies = async () => {
        const res = await axios.get('https://api.themoviedb.org/3/trending/all/day?api_key=67de9c730a62d09e71d509fc5e3e6659');
        console.log(res.data);
        this.setState({
            movies: res.data.results
        });
    };

    render() {
        return (
            <div className="row">
                {
                    this.state.movies.map(movie => (
                        <div className="col-md-3 p-2 box" key={movie.id}>
                            <Link className="movie-detail" to={`/movie-detail/${movie.id}`}>
                                <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}></img>
                            </Link>
                        </div>

                    ))
                }
            </div>
        )
    }
}
