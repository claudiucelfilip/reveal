import React, { useState, useEffect, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link } from 'react-router-dom';
import Html from './Html';

const smartContract = SmartContract.getInstance();

const Home = () => {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await smartContract.getPosts();
                setPosts(posts);
            } catch (err) {
                console.err(err);
            }
        };

        fetchData();
    }, []);
    return (
        <>
            <h1>Home</h1>
            {posts.map(post => (
                <article className="article" key={post.id}>
                    <div className="rating">
                        {post.rating}
                    </div>
                    <div className="content">
                        <h3>{post.title}</h3>
                        <Html content={post.public_text} />
                        <Link to={'/post/' + post.id}>Read More</Link>
                    </div>
                </article>
            ))}
        </>
    );
};

export default Home;