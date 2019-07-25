import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Home from '../components/Home';


const IndexPage = (props) => {
  let postList = props.data.allRevealPost.edges.map(edge => edge.node);

  return (
    <Home posts={postList} />
  );
}

export default IndexPage;

export const listQuery = graphql`
query ListQuery {
  allRevealPost(
    sort: {
      fields: [score]
      order: [DESC]
    }
  ) {
    edges {
      node {
        id
        owner
        rating
        score
        tags
        title
        excerpt
        created_at
      }
    }
  }
}
`
