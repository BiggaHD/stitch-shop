import React, { Component } from "react";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import BSON from "bson";

import "./Add_EditProduct.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

class ProductEditPage extends Component {
  state = {
    isLoading: true,
    title: "",
    price: "",
    imageUrl: "",
    description: "",
  };

  async componentDidMount() {
    const { mode, id } = this.props.match.params;
    if (mode === "edit") {
      const mongodb = Stitch.defaultAppClient.getServiceClient(
        RemoteMongoClient.factory,
        "mongodb-atlas"
      );
      try {
        const productResponse = await mongodb
          .db("stitch-shop")
          .collection("products")
          .find({ _id: new BSON.ObjectID(id) })
          .asArray();
        const product = productResponse[0];
        product._id = product._id.toString();
        product.price = product.price.toString();
        this.setState({
          isLoading: false,
          title: product.name,
          price: product.price,
          imageUrl: product.image,
          description: product.description,
        });
      } catch (error) {
        console.log(error);
        this.props.onError(
          "Loading the product failed. Please try again later"
        );
        this.setState({ isLoading: false });
      }
    } else {
      this.setState({ isLoading: false, title: "" });
    }
  }

  editProductHandler = (event) => {
    event.preventDefault();
    if (
      this.state.title.trim() === "" ||
      this.state.price.trim() === "" ||
      this.state.imageUrl.trim() === "" ||
      this.state.description.trim() === ""
    ) {
      return;
    }
    this.setState({ isLoading: true });
    const productData = {
      name: this.state.title,
      price: BSON.Decimal128.fromString(this.state.price.toString()),
      image: this.state.imageUrl,
      description: this.state.description,
    };
    let request;
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    if (this.props.match.params.mode === "edit") {
      request = mongodb
        .db("stitch-shop")
        .collection("products")
        .updateOne(
          { _id: new BSON.ObjectId(this.props.match.params.id) },
          productData
        );
    } else {
      request = mongodb
        .db("stitch-shop")
        .collection("products")
        .insertOne(productData);
    }
    request
      .then((result) => {
        this.setState({ isLoading: false });
        this.props.history.replace("/products");
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.log(err);
        this.props.onError(
          "Editing or adding the product failed. Please try again later"
        );
      });
  };

  inputChangeHandler = (event, input) => {
    this.setState({ [input]: event.target.value });
  };

  render() {
    const { title, description, imageUrl, price } = this.state;
    let content = (
      <form className="edit-product__form" onSubmit={this.editProductHandler}>
        <Input
          label="Title"
          config={{ type: "text", value: title }}
          onChange={(event) => this.inputChangeHandler(event, "title")}
        />
        <Input
          label="Price"
          config={{ type: "number", value: price }}
          onChange={(event) => this.inputChangeHandler(event, "price")}
        />
        <Input
          label="Image URL"
          config={{ type: "text", value: imageUrl }}
          onChange={(event) => this.inputChangeHandler(event, "imageUrl")}
        />
        <Input
          label="Description"
          elType="textarea"
          config={{ rows: "5", value: description }}
          onChange={(event) => this.inputChangeHandler(event, "description")}
        />
        <Button type="submit">
          {this.props.match.params.mode === "add"
            ? "Create Product"
            : "Update Product"}
        </Button>
      </form>
    );
    if (this.state.isLoading) {
      content = <div className="loading-video"></div>;
    }
    return <main>{content}</main>;
  }
}

export default ProductEditPage;
