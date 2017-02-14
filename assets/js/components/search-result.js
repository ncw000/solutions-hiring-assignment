import React from 'react';

class SearchResult extends React.Component {
    render () {
        // The current search result 'hit'
        let result = this.props.hitData;
        return <div className="search-result">
            <img src={result.image_url}></img>
            <div className="result-details">
                <h4>{result.name}</h4>
                <div className="result-rating">
                    <span className="star-count">{result.stars_count}</span>
                    <span className="reviews-count">&nbsp;({result.reviews_count} reviews)</span>
                </div>
                <div className="result-info-subtitle">
                    {result.food_type}&nbsp;|&nbsp;{result.neighborhood}&nbsp;|&nbsp;{result.price_range}
                    <br/>
                    {result.city},&nbsp;{result.country}    
                </div>
            </div>
        </div>
    }
}

export { SearchResult }