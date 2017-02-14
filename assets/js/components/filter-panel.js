import React from 'react';

import { FoodTypeFilter } from './food-type-filter';
import { PaymentFilter } from './payment-filter';
import { StarFilter } from './star-filter';

// Panel of search filter options on the left side of the app
class FilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Three index values to indicate which (if any) of the cuisine, rating, or payment
            // options are currently selected
            selectedCuisine: -1,
            selectedRating: -1,
            selectedPayment: -1,
            // The counts of search results for the listed cuisine types
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

    // The following three handler functions are called when one of the filter buttons are clicked.
    // They set the index corresponding to which of the filter buttons was clicked to control coloring
    // them as selected, and also set the appropriate Algolia filter text
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
            this.props.onRatingFilter(filter);
        });
    }

    handlePaymentFilter(index, filter) {
        let newSelection = index;
        if (this.state.selectedPayment == index) {
            newSelection = -1;
            filter = "";
        }

        this.setState({selectedPayment: newSelection}, () => {
            this.props.onPaymentFilter(filter);
        });
    }

    render() {
        // Names of the cusines listed as filters.
        // TODO: Abstract out to remove redundency with the intial state of this.state.counts
        const cuisineNames = [
            'Italian',
            'American',
            'Californian',
            'French',
            'Seafood',
            'Japanese',
            'Indian',
        ];

        // Generate FoodTypeFilter buttons for each of the above cuisine names
        let cuisines = [];
        for (var i = 0; i < cuisineNames.length; i++) {
            let count = 0;
            let name = cuisineNames[i];
            // Whether or not this button is currenlty selected
            let isSelected = i == this.state.selectedCuisine ? true : false;

            // Set the query results counter
            if (this.props.counts) {
                count = this.props.counts[name]; // this.state.counts[name];
            }

            cuisines.push(<FoodTypeFilter onFilter={this.handleCuisineFilter} 
                            key={i} itemIndex={i} name={name} count={count} isSelected={isSelected}/>);
        }

        // Generate buttons to select by rating star count
        let ratings = [];
        for (var i = 0; i <= 5; i++) {
            let isSelected = i == this.state.selectedRating ? true : false;
            ratings.push(<StarFilter onFilter={this.handleRatingFilter}
                            key={i} itemIndex={i} rating={i} isSelected={isSelected} />);
        }

        // Generate buttons to select by payment option count
        let paymentOptions = [];
        let paymentOptionsText = [
            'AMEX',
            'Visa',
            'Discover',
            'MasterCard'
        ];

        for (var i = 0; i < paymentOptionsText.length; i++) {
            let isSelected = i == this.state.selectedPayment ? true : false;
            paymentOptions.push(<PaymentFilter onFilter={this.handlePaymentFilter}
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

export { FilterPanel }