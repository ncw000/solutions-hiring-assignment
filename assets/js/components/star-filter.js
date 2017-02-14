import React from 'react';

// A button to filter by a given rating, located in the FilterPanel
class StarFilter extends React.Component {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
    }
    
    // Generate the Algolia query filter string to show results with the same number of stars (or more)
    // as the rating for this filter
    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `stars_count>=${this.props.rating}`)
    }

    render() {
        // Generate the css class for this item, using selected-filter if this element has
        // been selected with a click.
        let filterClass = "star-filter-item";
        if (this.props.isSelected) filterClass += " selected-filter";

        // Append gold or gray star images to this element until we have the correct # of gold
        // stars to indicate the correct rating
        // TODO: It's fairly strange to generate this. I've not had time to piece together unique
        // star-bars for each rating, but that would likely be a better approach over this method.
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

export { StarFilter }