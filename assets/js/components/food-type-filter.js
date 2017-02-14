import React from 'react';

// A button to filter by a given cuisine type, located in the FilterPanel
class FoodTypeFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }

    // Apply the food_type filter for Algolia filter search
    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `food_type:\"${this.props.name}\"`)
    }

    render() {
        // Generate the css class for this item, using selected-filter if this element has
        // been selected with a click.
        let filterClass = "food-type-filter-item";
        if (this.props.isSelected) filterClass += " selected-filter";

        return <div onClick={this.applyFilter} className={filterClass}>
            <span className="cuisine-name">{this.props.name}</span>
            <span className="cuisine-filter-count">{this.props.count}</span>
        </div>
    }
}

export { FoodTypeFilter }