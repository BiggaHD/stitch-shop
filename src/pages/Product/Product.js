import React, { Component } from "react";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import BSON from "bson";

import "./Product.css";

class ProductPage extends Component {
  state = { isLoading: true, product: null };

  async componentDidMount() {
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    try {
      const productResponse = await mongodb
        .db("stitch-shop")
        .collection("products")
        .find({ _id: new BSON.ObjectID(this.props.match.params.id) })
        .asArray();
      const product = productResponse[0];
      product._id = product._id.toString();
      product.price = product.price.toString();
      this.setState({ isLoading: false, product: product });
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
      this.props.onError("Loading the product failed. Please try again later");
    }
  }

  render() {
    let content = <div className="loading-video"></div>;

    if (!this.state.isLoading && this.state.product) {
      content = (
        <main className="product-page">
          <h1>{this.state.product.name}</h1>
          <h2>{this.state.product.price}</h2>
          <div
            className="product-page__image"
            style={{
              backgroundImage: "url('" + this.state.product.image + "')",
            }}
          />
          <p>{this.state.product.description}</p>
        </main>
      );
    }
    if (!this.state.isLoading && !this.state.product) {
      content = (
        <main>
          <p>Found no product. Try again later.</p>
        </main>
      );
    }
    return content;
  }
}

export default ProductPage;
