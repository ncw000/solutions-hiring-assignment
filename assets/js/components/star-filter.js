import React from 'react';

// A button to filter by a given rating, located in the FilterPanel
class StarFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ratingLocked: false,
            selectedRating: 0,
            hoveredRating: 0
        }
        this.handleStarClicked = this.handleStarClicked.bind(this);
        this.handleStarMouseOver = this.handleStarMouseOver.bind(this);
        this.handleStarMouseLeave = this.handleStarMouseLeave.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }
    
    handleStarClicked(e) {
        // If you click the star we've already locked in to, unselect ratings
        // and re-filter
        if (this.state.hoveredRating == this.state.selectedRating) {
            this.setState({
                selectedRating: 0,
                hoveredRating: 0,
                ratingLocked: false
            }, () => {
                this.applyFilter();
            });
        } 
        // Otherwise, lock in the current star as the new rating, and re-filter
        else {
            this.setState({
                selectedRating: this.state.hoveredRating,
                ratingLocked: true
            }, () => {
                this.applyFilter();
            });
        }

        // if (rating != this.state.selectedRating) {
        //     this.setState({ratingLocked: true}, () => {
        //         this.applyFilter();
        //     });
        // } else {
        //     this.setState({ratingLocked: false});
        // }
    }

    handleStarMouseOver(e) {
        // Get the star id stored in the data-id attribute
        // corresponds to the # of stars lit, ranging from 0 to 6
        let rating = e.target.dataset.id;
        this.setState({hoveredRating: rating});
    }

    handleStarMouseLeave(e) {
        this.setState({hoveredRating: this.state.selectedRating});
    }

    // Generate the Algolia query filter string to show results with the same number of stars (or more)
    // as the rating for this filter
    applyFilter() {
        this.props.onFilter(this.props.itemIndex, `stars_count>=${this.state.selectedRating}`)
        console.log(this.state.selectedRating);
    }

    render() {
        // Generate the css class for this item, using selected-filter if this element has
        // been selected with a click.
        let filterClass = "star-filter-item";
        // if (this.props.isSelected) filterClass += " selected-filter";

        // Append gold or gray star images to this element until we have the correct # of gold
        // stars to indicate the correct rating
        // TODO: It's fairly strange to generate this. I've not had time to piece together unique
        // star-bars for each rating, but that would likely be a better approach over this method.
        let stars = [];
        for (var i = 0; i < 6; i++) {
            let starPath = "";
            // Choose the empty or gold colored star based on the currently selected rating.
            if (i >= (this.state.hoveredRating)) {
                starPath = "resources/graphics/star-empty.png";
            } else {
                starPath = "resources/graphics/stars-plain.png";
            }
            stars.push(<img data-id={i+1}
                            onClick={this.handleStarClicked}
                            onMouseOver={this.handleStarMouseOver} onMouseLeave={this.handleStarMouseLeave}
                            key={i} src={starPath}></img>);
        }

        return <div className={filterClass}>
            {stars}
        </div>
    }
}

export { StarFilter }