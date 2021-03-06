const { ApolloServer, gql } = require("apollo-server");
const models = require("./models");
const bcrypt = require("bcryptjs");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    recipes: [Recipe!]!
  }

  type Recipe {
    id: Int!
    title: String!
    ingredients: String!
    direction: String!
    user: User!
  }

  type Link {
    id: Int!
    url: String!
    slug: String!
  }

  type Query {
    user(id: Int!): User
    allRecipes: [Recipe!]!
    recipe(id: Int!): Recipe
    allLinks: [Link!]!
    link(id: Int!): Link
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    createRecipe(
      userId: Int!
      title: String!
      ingredients: String!
      direction: String!
    ): Recipe!
    createLink(url: String!, slug: String!): Link!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    async user(root, { id }, { models }) {
      return models.User.findByPk(id);
    },
    async allRecipes(root, args, { models }) {
      return models.Recipe.findAll();
    },
    async recipe(root, { id }, { models }) {
      return models.Recipe.findByPk(id);
    },
    async allLinks(root, args, { models }) {
      return models.Link.findAll();
    },
    async link(root, { id }, { models }) {
      return models.Link.findByPk(id);
    }
  },
  Mutation: {
    async createUser(root, { name, email, password }, { models }) {
      return models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
      });
    },
    async createRecipe(
      root,
      { userId, title, ingredients, direction },
      { models }
    ) {
      return models.Recipe.create({ userId, title, ingredients, direction });
    },
    async createLink(root, { url, slug }, { models }) {
      return models.Link.create({
        url,
        slug
      });
    }
  },
  User: {
    async recipes(user) {
      return user.getRecipes();
    }
  },
  Recipe: {
    async user(recipe) {
      return recipe.getUser();
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { models }
});

server.listen().then(({ url }) => {
  console.log(`???? Server ready at ${url}`);
});
