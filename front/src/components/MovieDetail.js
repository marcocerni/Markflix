import React, {Component} from 'react'
import axios from 'axios'
import Rating from 'react-rating'

require('dotenv').config();

export default class Home extends Component {

    state = {
        movie: []
    };

    async componentDidMount() {
        this.getMovie();
    }

    getMovie = async () => {
        console.log(this.props.match.params.id);
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${this.props.match.params.id}?api_key=67de9c730a62d09e71d509fc5e3e6659&language=en-US
`);
        console.log(res.data);
        this.setState({
            movie: res.data
        });
    };



    render() {
        return (
            <div className="w-100" key={this.state.movie.id}>
                <div className="card">
                    <div className="card-header d-flex justify-content-between">
                        <h5>{this.state.movie.title}</h5>
                        <button className="btn btn-primary">
                            <i className="material-icons">
                                Watch</i>
                        </button>
                    </div>
                    <div className="card-body">
                        <img style={{display: "block", float: "left"}} src={`https://image.tmdb.org/t/p/w200${this.state.movie.poster_path}`}></img>
                        <div style={{marginLeft: 210}}>
                        <p>
                            {this.state.movie.overview}
                        </p>
                        <p>
                            Date: {this.state.movie.release_date}
                        </p>
                        <p>Rate:</p>
                        <Rating
                            placeholderRating={this.state.movie.vote_average/2}
                            fractions={2}/>
                        </div>
                    </div>
                    <div id="player" class="webtor" />
                    <script>

                    </script>
                    <script src="https://cdn.jsdelivr.net/npm/@webtor/player-sdk-js/dist/index.min.js" charset="utf-8"></script>
                </div>
            </div>
        )
    }
}
