import React from 'react';
import ReactDOM from 'react-dom';
import algoliasearch from 'algoliasearch';

// TODO: Remove duplication w/ state
var cuisineNames = [
    'Italian',
    'American',
    'Californian',
    'French',
    'Seafood',
    'Japanese',
    'Indian',
];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearchbarInput = this.handleSearchbarInput.bind(this);
        this.handleCuisineFilter = this.handleCuisineFilter.bind(this);
        this.handleRatingFilter = this.handleRatingFilter.bind(this);
        this.handlePaymentFilter = this.handlePaymentFilter.bind(this);
        this.updateCuisineCounts = this.updateCuisineCounts.bind(this);
        
        this.state = { 
            algoliaResults: {}, 
            queryText: '',
            cuisineFilter: '',
            ratingFilter: '',
            paymentFilter: '',
            cuisineCounts: {},
            geolocation: false
        };
    }

    componentWillMount() {
        this.performSearch().then(() => {
            this.updateCuisineCounts();
        });
    }

    componentDidMount() {
        // Load geolocation, if available
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function success(position) {
                geolocation = position.coords;
            }, function error(err) {
                // TODO: Handle error
                console.log(err);
            });
        }
    }

    handleSearchbarInput(event) {
        this.setState({queryText: event.target.value}, () =>{
            this.performSearch().then(() => {
                this.updateCuisineCounts();
            });
        });
    }

    performSearch() {
        let that = this;
        let searchOptions = {
            facets: 'food_type,stars_count,payment_options',
            filters: this.buildFilterString()
        };

        // Geolocation
        // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation

        if (this.state.geolocation) {
            let coords = this.state.geolocation;
            searchOptions.aroundLatLng = coords.latitude + "," + coords.longitude;
        } else {
            searchOptions.aroundLatLngViaIP = true;
        }

        return index.search(this.state.queryText, searchOptions)
        .then(function success(results) {
            // Store the search results in React state
            // TODO: Consider storing a subset of the results instead.
            // TODO: We do not currently retrieve the additional results that do not fit
            // in the current search page.
            that.setState({algoliaResults: results});
        }, function failed(err) {
            // TODO: Properly handle errors
            console.error(err);
        });
    }

    buildFilterString() {
         let activeFilters = [];
         
         [this.state.cuisineFilter, 
         this.state.ratingFilter, 
         this.state.paymentFilter].forEach(filter => {
             if (filter !== '') activeFilters.push(filter);
         });

         return activeFilters.join(' AND ');
    }

    updateCuisineCounts() {
        this.setState({cuisineCounts: this.state.algoliaResults.facets.food_type});
    }

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
                <ResultsPanel searchResults={this.state.algoliaResults} />
            </section>
        </div>
    }
}

class SearchBar extends React.Component {
    render() {
        let placeholderText = "Search for Restaurants by Name, Cuisine, Location";
        return <section className="search-bar">
                <div className="search">
                <input className="searchInput" placeholder={placeholderText}
                    onChange={this.props.onSearchInput}></input>
                </div>
            </section>
    }
}

class FilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCuisine: -1,
            selectedRating: -1,
            selectedPayment: -1,
            counts: {
                'Italian': 0,
                'American': 0,
                'Californian': 0,
                'French': 0,
                'Seafood': 0,
                'Japanese': 0,
                'Indian': 0,
            }
        }
        this.handleCuisineFilter = this.handleCuisineFilter.bind(this);
        this.handleRatingFilter = this.handleRatingFilter.bind(this);
        this.handlePaymentFilter = this.handlePaymentFilter.bind(this);
    }

    // updateCuisineCounts(foodTypeCounts) {
    //     this.setState({
    //         counts: {
    //             'Italian': foodTypeCounts['Italian'],
    //             'American': foodTypeCounts['American'],
    //             'Californian': foodTypeCounts['Californian'],
    //             'French': foodTypeCounts['French'],
    //             'Seafood': foodTypeCounts['Seafood'],
    //             'Japanese': foodTypeCounts['Japanese'],
    //             'Indian': foodTypeCounts['Indian'],
    //         }
    //     });
    // }

    handleCuisineFilter(index, filter) {
        let newSelection = index;
        if (this.state.selectedCuisine == index) {
            newSelection = -1;
            filter = "";
        }

        this.setState({selectedCuisine: newSelection}, () => {
            this.props.onCuisineFilter(filter);
        });
    }

    handleRatingFilter(index, filter) {
        let newSelection = index;
        if (this.state.selectedRating == index) {
            newSelection = -1;
            filter = "";
        }

        this.setState({selectedRating: newSelection}, () => {
            this.props.onCuisineFilter(filter);
        });
    }

    handlePaymentFilter(index, filter) {
        let newSelection = index;
        if (this.state.selectedPayment == index) {
            newSelection = -1;
            filter = "";
        }

        this.setState({selectedPayment: newSelection}, () => {
            this.props.onCuisineFilter(filter);
        });
    }

    render() {
        let cuisines = [];
        for (var i = 0; i < cuisineNames.length; i++) {
            let count = 0;
            let name = cuisineNames[i];
            let isSelected = i == this.state.selectedCuisine ? true : false;

            if (this.props.counts) {
                count = this.props.counts[name]; // this.state.counts[name];
            }

            // if (this.props.searchResults.hasOwnProperty('hits')) {
            //     count = this.props.searchResults.facets.food_type[name];
            // }
            cuisines.push(<FoodTypeFilter onFilter={this.handleCuisineFilter} 
                            key={i} itemIndex={i} name={name} count={count} isSelected={isSelected}/>);
        }

        let ratings = [];

        for (var i = 0; i <= 5; i++) {
            let isSelected = i == this.state.selectedRating ? true : false;
            ratings.push(<StarFilter onFilter={this.handleRatingFilter}
                            key={i} itemIndex={i} rating={i} isSelected={isSelected} />);
        }

        let paymentOptions = [];
        let paymentOptionsText = [
            'AMEX/American Express',
            'Visa',
            'Discover',
            'MasterCard'
        ];

        for (var i = 0; i < paymentOptionsText.length; i++) {
            let isSelected = i == this.state.selectedPayment ? true : false;
            paymentOptions.push(<PaymentFilter onFilter={this.handleRatingFilter}
                                    key={i} itemIndex={i} optionText={paymentOptionsText[i]}
                                    option={i} isSelected={isSelected} />);
        }

        return <section className="filter-panel">
                <h4>Cuisine/Food Type</h4>
                {cuisines}
                <h4>Rating</h4>
                {ratings}
                <h4>Payment Options</h4>
                {paymentOptions}
            </section>
    }
}

class FoodTypeFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }

    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `food_type:\"${this.props.name}\"`)
    }

    render() {
        let filterClass = "food-type-filter-item";
        if (this.props.isSelected) filterClass += " selected-filter";

        return <div onClick={this.applyFilter} className={filterClass}>
            <span className="cuisine-name">{this.props.name}</span>
            <span className="cuisine-filter-count">{this.props.count}</span>
        </div>
    }
}

class StarFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }
    
    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `stars_count>=${this.props.rating}`)
    }

    render() {
        let filterClass = "star-filter-item";
        if (this.props.isSelected) filterClass += " selected-filter";

        let stars = [];

        for (var i = 0; i < this.props.rating; i++) {
            stars.push(<img key={i} src="resources/graphics/stars-plain.png"></img>);
        }

        for (var i = this.props.rating; i < 5; i++) {
            stars.push(<img key={i} src="resources/graphics/star-empty.png"></img>);
        }

        return <div onClick={this.applyFilter} className={filterClass}>
            {stars}
        </div>
    }
}

class PaymentFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }
    
    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `food_type:\"${this.props.name}\"`)
    }

    render() {
        let filterClass = "payment-option";
        if (this.props.isSelected) filterClass += " selected-filter";
        return <div onClick={this.applyFilter} 
                    className={filterClass}>
                    {this.props.optionText}
                </div>
    }
}   

class ResultsPanel extends React.Component {
    render() {
        let results = this.props.searchResults;
        let resultsList = [];
        let resultCount = 0;
        let queryTime = 0;
        
        if (results.hits) {
            resultsList = results.hits.map((result, i) => {
                return <SearchResult key={i} hitData={result}/>
            });

            resultCount = results.nbHits;
            queryTime = (results.processingTimeMS / 1000).toFixed(3);
        }

        return <section className="results-panel">
            <div className="results-found-bar">
                <span className="results-count"><em>{resultCount} results found</em> in {queryTime} seconds</span>
            </div>
            <div className="results-list-panel">
                {resultsList}
            </div>
            <div className="show-more-bar">
                <button className="showMoreBtn">Show More</button>
            </div>
        </section>
    }
}

class SearchResult extends React.Component {
    render () {
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

let client = algoliasearch('EBQT59Q46J', '4b9c3ae37debd5744ba4f233ef23877c', {protocol: 'https:'});
let index = client.initIndex('solutions_hiring_restaurants');
//index.setSettings({attributesForFaceting: ["food_type", "stars_count", "payment_options"]})
// index.search('Edgewater', function searchDone(err, content) {
//     console.log(err, content);
// });

ReactDOM.render(<App searchIndex={index}/>, $('#content')[0]);