import React from 'react';

// The search query entry bar at the top of the app
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

export { SearchBar as SearchBar }