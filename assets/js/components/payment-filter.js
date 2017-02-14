import React from 'react';

// A button to filter by a given payment type, located in the FilterPanel
class PaymentFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }
    
    // Apply the payment_option filter for Algolia filter search
    applyFilter() {
        let filterText = this.props.optionFilter.map(option => {
            return `payment_options:\"${option}\"`
        })

        filterText = '(' + filterText.join(' OR ') + ')';

        // this.props.optionFilter.join(' OR ');
        this.props.onFilter(this.props.itemIndex, filterText);
    }

    render() {
        // Generate the css class for this item, using selected-filter if this element has
        // been selected with a click.
        let filterClass = "payment-option";
        if (this.props.isSelected) filterClass += " selected-filter";
        return <div onClick={this.applyFilter} 
                    className={filterClass}>
                    {this.props.optionText}
                </div>
    }
}   

export { PaymentFilter }