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
            selectedPayment: -1,
            // The counts of search results for the listed cuisine types
            counts: {
                '': 0
            },
            isExpanded: false
        }
        this.handleCuisineFilter = this.handleCuisineFilter.bind(this);
        this.handleRatingFilter = this.handleRatingFilter.bind(this);
        this.handlePaymentFilter = this.handlePaymentFilter.bind(this);
        this.toggleCuisineList = this.toggleCuisineList.bind(this);
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
        this.props.onRatingFilter(filter);
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

    toggleCuisineList() {
        this.setState({isExpanded: !this.state.isExpanded});
    }

    render() {
        // Generate FoodTypeFilter buttons for each of the above cuisine names
        let cuisines = [];

        let cuisineNames = Object.keys(this.props.counts).sort();

        for (var i = 0; i < cuisineNames.length; i++) {
            var cuisineName = cuisineNames[i];
            let count = this.props.counts[cuisineName];
            // Whether or not this button is currently selected
            let isSelected = i == this.state.selectedCuisine ? true : false;

            cuisines.push(<FoodTypeFilter onFilter={this.handleCuisineFilter} 
                            key={i} itemIndex={i} name={cuisineName} count={count} 
                            isSelected={isSelected}/>);
        }

        // Generate buttons to select by payment option count
        let paymentOptions = [];
        let paymentOptionsText = [
            'AMEX',
            'Visa',
            'Discover',
            'MasterCard'
        ];

        let paymentOptionsFilters = [
            ['AMEX'],
            ['Visa'],
            ['Discover'],
            ['MasterCard', 'Diners Club', 'Carte Blanche']
        ]


        for (var i = 0; i < paymentOptionsText.length; i++) {
            let isSelected = i == this.state.selectedPayment ? true : false;
            paymentOptions.push(<PaymentFilter onFilter={this.handlePaymentFilter}
                                    key={i} itemIndex={i} 
                                    optionText={paymentOptionsText[i]} optionFilter={paymentOptionsFilters[i]}
                                    option={i} isSelected={isSelected} />);
        }

        let expansionText = this.state.isExpanded ? '[-]' : '[+]';
        let expansionClass = this.state.isExpanded ? '' : 'hiddenCuisineList';

        return <section className="filter-panel">
                <span className="cuisinePanelHeader" onClick={this.toggleCuisineList}>
                    <h4>Cuisine/Food Type</h4>&nbsp;{expansionText}
                </span>
                <div className={expansionClass} >
                    {cuisines}
                </div>
                <h4>Rating</h4>
                <StarFilter onFilter={this.handleRatingFilter}
                    itemIndex={0} rating={6} />
                <h4>Payment Options</h4>
                {paymentOptions}
            </section>
    }
}

export { FilterPanel }