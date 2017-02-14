import React from 'react';

import { SearchResult } from './search-result';

// The panel at the center of the app that shows a list of search results
class ResultsPanel extends React.Component {
    render() {
        // Note: For convenience, I've set some UI set-up code at the beginning of the render() functions throughout
        // the components in this exercise. I suspect this may be bad style. Investigate

        // The holds the <SearchResults> the place in the panel
        let resultsList = [];
        // The calculated # of seconds used to perform the last Algolia query
        let queryTime = (this.props.queryProcessingTime / 1000).toFixed(3);
        
        // If the Algolia search yielded hits, generate the <SearchResult> elements
        if (this.props.numberOfHits > 0)  {
            resultsList = this.props.searchResults.map((result, i) => {
                return <SearchResult key={i} hitData={result}/>
            });
        }

        return <section className="results-panel">
            <div className="results-found-bar">
                <span className="results-count"><em>{this.props.numberOfHits} results found</em> in {queryTime} seconds</span>
            </div>
            <div className="results-list-panel">
                {resultsList}
            </div>
            <div className="show-more-bar">
                <button onClick={this.props.onShowMore} className="showMoreBtn">Show More</button>
            </div>
        </section>
    }
}

export { ResultsPanel }