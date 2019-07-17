import React from "react";
import { Link } from "gatsby";
import { graphql } from "gatsby";
import Layout from "../components/layout";

const IndexPage = (props) => {
  const postList = props.data.allRevealPost;
  return (
    <Layout>
      {postList.edges.map(({ node }, i) => (
        <Link to={node.id} className="link" >
          <div className="post-list">
            <h1>{node.title}</h1>
            <p>{node.excerpt}</p>
          </div>
        </Link>
      ))}
    </Layout>
  );
}

export default IndexPage


export const listQuery = graphql`
  query ListQuery {
    allRevealPost {
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