const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: dishes });
};

function namePropertyIsValid(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (!name || name === "") {
    next({ status: 400, message: `Dish must include a name` });
  }
  next();
}

function descriptionIsValid(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (!description || description === "") {
    next({ status: 400, message: `Dish must include a description` });
  }
  next();
}

function priceIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    next({ status: 400, message: `Dish must include a price` });
  }
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  next();
}

function imageUrlIsValid(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (!image_url || image_url === "") {
    next({ status: 400, message: `Dish must include a image_url` });
  }
  next();
}

function idMatches(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { dishId } = req.params;

  if (!id || typeof id === "undefined") {
    next();
  }

  if (id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({ status: 404, message: `Dish does not exist: ${dishId}` });
  }
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    namePropertyIsValid,
    descriptionIsValid,
    priceIsValid,
    imageUrlIsValid,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    namePropertyIsValid,
    descriptionIsValid,
    priceIsValid,
    imageUrlIsValid,
    idMatches,
    update,
  ],
};
