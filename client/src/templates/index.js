import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Home  from '../components/Home';


const IndexPage = (props) => {
  let postList =  props.pageContext.allRevealPost.map(edge => edge.node);

  return (
    <Home posts={postList} />
  );
}

export default IndexPage;