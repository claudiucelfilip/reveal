import React from 'react';
import Layout from '../components/layout';

const BlogPost = (props) => {
    const post = props.data.revealPost;

    return (
        <Layout>
            <div>
                <h1>{post.title}</h1>
                <p>{post.excerpt}</p>
            </div>
        </Layout>
    )
}

export default BlogPost;


export const query = graphql`
query PostQuery($slug: String!) {
    revealPost(id: {eq: $slug}) {
        title
        excerpt
      }
}`;