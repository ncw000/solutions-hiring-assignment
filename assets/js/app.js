import React from 'react';
import ReactDOM from 'react-dom';
import algoliasearch from 'algoliasearch';

import { FilterPanel } from './components/filter-panel';
import { ResultsPanel } from './components/results-panel';
import { SearchBar } from './components/search-bar';

// Initalize our connection to the Algolia index
let client = algoliasearch('EBQT59Q46J', '4b9c3ae37debd5744ba4f233ef23877c', {protocol: 'https:'});
let index = client.initIndex('solutions_hiring_restaurants');

// Root of the Restaurant Locater application. See the bottom of this file for our root ReactDOM.render

// Note: I've taken care to document a few recurring, odd patterns with this React code, such as the
// the bind calls in the constructor. I won't repeat this documentation when the patterns reappear in the
// other React components, for sake of brevity
class App extends React.Component {
    constructor(props) {
        super(props); // Required when using React constructor syntax to make 'this.props' function
        // Unfortunately, React does not auto bind 'this' inside class member functions when you're using
        // the class syntax. These lines force the binding, and is a common workaround http://stackoverflow.com/a/33973758/183969
        // TODO: Investigate the alternatives provided at that link
        this.handleSearchbarInput = this.handleSearchbarInput.bind(this);
        this.handleCuisineFilter = this.handleCuisineFilter.bind(this);
        this.handleRatingFilter = this.handleRatingFilter.bind(this);
        this.handlePaymentFilter = this.handlePaymentFilter.bind(this);
        this.updateCuisineCounts = this.updateCuisineCounts.bind(this);
        this.handleShowMoreClicked = this.handleShowMoreClicked.bind(this);
        
        this.state = { 
            // The data payload from the most recent Algolia search
            algoliaResults: {},
            // Filter counts provided by Algolia for the Cuisine/Food Type display
            cuisineCounts: {},
            // The search hits that are currently displayed, including from previous pages retrieved from previous searches with
            // this query
            displayedResults: {},
            // Geolocation flag. See componentDidMount()
            geolocation: false,
            // Number of hits given by the previous Algolia search
            numberOfHits: 0,
            // Number of pages of data currently loaded for the current search
            pagesLoaded: 0,
            // Text input into the SearchBar, used to query Algolia
            queryText: '',
            // Algolia's processingTimeMS for the recent query
            queryProcessingTime: 0,
            // The Algolia search syntax to be applied to the current search. See buildFilterString()
            cuisineFilter: '',
            ratingFilter: '',
            paymentFilter: '',            
        };
    }

    componentWillMount() {
        // Perform a plain search with the empty string to query for all results in the index,
        // and update the result counts on the Cuisines filter
        // TODO: This '.then() => { this.updateCuisineCounts() ;});' is repeated in a few places.
        // Refactor?
        this.performSearch().then(() => {
            this.updateCuisineCounts();
        });
    }

    componentDidMount() {
        // Attempt to load the user's current geolocation for use in Algolia search. If this fails 
        // (potentially b/c the user denied access), then we'll fall back to lat/lon via IP address.
        // See performSearch()

        // Hold onto our reference to this component for use in callback below
        let that = this;
        // Load geolocation, if available
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function success(position) {
                that.setState({geolocation: position.coords});
            }, function error(err) {
                // TODO: Handle error
                console.log(err);
            });
        }
    }

    // Fire an as-you-type search when the user types in the search bar
    handleSearchbarInput(event) {
        this.setState({queryText: event.target.value}, () =>{
            this.performSearch().then(() => {
                this.updateCuisineCounts();
            });
        });
    }

    // Perform an Algolia search.
    // TODO: To be honest, I'm pretty envious of the search state management performed by Algolia's instantsearch.js library.
    // We have a lot of special casing here for various search options. In the future, consider looking to see if we can't replicate
    // the instantsearch interface to make this more reasonable
    // Note: At the moment, we use this function oddly in that the pageNumber param is only !== undefined if we're asking the next
    // page of data via the 'Show More' button
    performSearch(pageNumber) {
        // Hold onto our reference to this component for use in callback below
        let that = this;
        // Options sent to the Algolia index's search()
        let searchOptions = {
            facets: 'food_type,stars_count,payment_options',
            filters: this.buildFilterString()
        };

        if (pageNumber !== undefined) {
            searchOptions.page = this.state.pagesLoaded
        }

        // If geolocation was successfully set in componentDidMount(), get the current lat/lon.
        if (this.state.geolocation) {
            let coords = this.state.geolocation;
            searchOptions.aroundLatLng = coords.latitude + "," + coords.longitude;
        } 
        // Otherwise default to lat/long via IP address
        else {
            searchOptions.aroundLatLngViaIP = true;
        }

        // Query Algolia and process results in a promise resolution
        return index.search(this.state.queryText, searchOptions)
        .then(function success(results) {
            // Determine how many pages of data we've loaded thus far, and the total set of results now displayed.
            // displayedResults = results for previously queried pages (if any) + the current page
            let pagesLoaded = 0;
            let displayedResults = [];

            // If a page number was given, then the user clicked 'Show More' and has thus already loaded the previous pages.
            if (pageNumber !== undefined) {
                pagesLoaded = pageNumber; // Note 0-based indexing for pages in Algolia queries
                displayedResults = that.state.displayedResults.concat(results.hits);
            } else {
                // Otherwise, we're doing a brand new search and are only showing the first page
                pagesLoaded = 1;
                displayedResults = results.hits;
            }
            
            // Update our react state, which will redraw the UI
            that.setState({
                algoliaResults: results,
                displayedResults: displayedResults,
                pagesLoaded: pagesLoaded,
                numberOfHits: results.nbHits,
                queryProcessingTime: results.processingTimeMS,
            });
        }, function failed(err) {
            // TODO: Properly handle errors
            console.error(err);
        });
    }

    // Generate the search filter string based on the current selections of cuisine, rating, and payment option filters
    buildFilterString() {
         let activeFilters = [];
         
         // Push the filters that are not empty onto the actives list
         [this.state.cuisineFilter, 
         this.state.ratingFilter, 
         this.state.paymentFilter].forEach(filter => {
             if (filter !== '') activeFilters.push(filter);
         });

         // Combine with conjunctive syntax
         return activeFilters.join(' AND ');
    }

    // Grabs the food_type facet from the recent Algolia search and adds it to React state
    updateCuisineCounts() {
        this.setState({cuisineCounts: this.state.algoliaResults.facets.food_type});
    }

    // These three functions fire a new search based on the filter selection for cuisine type, rating, or payment option,
    // respectively. Note that the filter string is built in the filter components inside <FilterPanel>
    // TODO: Consider abstracting the body of these out into a single function.
    handleCuisineFilter(filterString) {
        this.setState({cuisineFilter: filterString}, () => {
            this.performSearch();
        });
    }
    handleRatingFilter(filterString) {
        this.setState({ratingFilter: filterString}, () => {
            this.performSearch();
        });
    }
    handlePaymentFilter(filterString) {
        this.setState({paymentFilter: filterString}, () => {
            this.performSearch();
        });
    }

    // Load the next page of query results when the user clicks the 'Show More' button
    handleShowMoreClicked() {
        this.performSearch(this.state.pagesLoaded);
    }

    // Contains the three principal components of the app:
    //      Search bar at the top
    //      List of search filter buttons on the left
    //      Display of search results in the middle
    render() {
        return <div className="page-wrap">
            <SearchBar onSearchInput={this.handleSearchbarInput} />
            <section className="main-section">
                <FilterPanel
                 counts={this.state.cuisineCounts}
                 onCuisineFilter={this.handleCuisineFilter}
                 onRatingFilter={this.handleRatingFilter}
                 onPaymentFilter={this.handlePaymentFilter}
                 searchResults={this.state.algoliaResults} />
                <ResultsPanel 
                onShowMore={this.handleShowMoreClicked}
                searchResults={this.state.displayedResults} 
                numberOfHits={this.state.numberOfHits}
                queryProcessingTime={this.state.queryProcessingTime}/>
            </section>
        </div>
    }
}

ReactDOM.render(<App searchIndex={index}/>, $('#content')[0]);