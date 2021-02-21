import React, { Component } from 'react';
import MiniModal from '../../components/Modal/MiniModal.js';
import { connect } from 'react-redux';
import { getMyNames } from '../../ducks/myDomains.js';
import Dropdown from '../../components/Dropdown';
import { transferExchangeLock } from '../../ducks/exchange.js';

export class PlaceListingModal extends Component {
  constructor(props) {
    super(props);

    this.durationOpts = [1, 3, 5, 7, 14];

    this.state = {
      startPrice: '',
      endPrice: '',
      nameIdx: 0,
      durationIdx: 0,
    };
  }

  componentDidMount() {
    this.props.getMyNames();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isPlacingListing && !this.props.isPlacingListing && !this.props.isPlacingListingError) {
      this.props.onClose();
    }

    if (prevProps.names !== this.props.names) {
      this.setState({
        name: this.props.names[0]
      });
      return;
    }
  }

  render() {
    const {onClose, names} = this.props;

    const isValid = this.state.startPrice.length &&
      this.state.endPrice.length &&
      Number(this.state.startPrice) > 0 &&
      Number(this.state.endPrice) > 0 &&
      Number(this.state.startPrice) > Number(this.state.endPrice);

    return (
      <MiniModal title="Place Listing" onClose={onClose}>
        <div className="exchange__place-listing-modal">
          <p>
            Placing a listing transfers your name to a locking address. Cancellation is possible, but
            requires an on-chain transaction.
          </p>

          <div className="exchange__label">Choose Name:</div>
          <div className="exchange__input">
            <Dropdown
              items={names.map(n => ({
                label: n,
              }))}
              onChange={(i) => this.setState({
                nameIdx: i,
              })}
              currentIndex={this.state.nameIdx}
            />
          </div>

          <label className="exchange__label">Starting price:</label>
          <div className="exchange__input send__input">
            <input
              type="number"
              value={this.state.startPrice}
              onChange={(e) => this.setState({
                startPrice: e.target.value,
              })}
            />
          </div>

          <label className="exchange__label">Ending price:</label>
          <div className="exchange__input send__input">
            <input
              type="number"
              value={this.state.endPrice}
              onChange={(e) => this.setState({
                endPrice: e.target.value,
              })}
            />
          </div>

          <label className="exchange__label">Duration:</label>
          <Dropdown
            items={this.durationOpts.map(d => ({
              label: `${d} days`,
            }))}
            onChange={(i) => this.setState({
              durationIdx: i,
            })}
            currentIndex={this.state.durationIdx}
          />

          <div className="place-bid-modal__buttons">
            <button
              className="place-bid-modal__cancel"
              onClick={onClose}
              disabled={this.props.isPlacingListing}
            >
              Cancel
            </button>

            <button
              className="place-bid-modal__send"
              onClick={() => this.props.transferExchangeLock(
                this.props.names[this.state.nameIdx],
                Number(this.state.startPrice) * 1e6,
                Number(this.state.endPrice) * 1e6,
                this.durationOpts[this.state.durationIdx]
              )}
              disabled={this.props.isPlacingListing || !isValid}
            >
              {this.props.isPlacingListing ? 'Loading...' : 'Place Listing'}
            </button>
          </div>
        </div>
      </MiniModal>
    );
  }
}

export default connect(
  (state) => ({
    isFetchingNames: state.myDomains.isFetching,
    names: Object.keys(state.myDomains.names),
    isPlacingListing: state.exchange.isPlacingListing,
    isPlacingListingError: state.exchange.isPlacingListingError,
  }),
  (dispatch) => ({
    getMyNames: () => dispatch(getMyNames()),
    transferExchangeLock: (name, startPrice, endPrice, durationDays) => dispatch(transferExchangeLock(
      name,
      startPrice,
      endPrice,
      durationDays,
    )),
  }),
)(PlaceListingModal);
