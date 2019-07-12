import React, { useState, useEffect, useCallback } from 'react';
import SmartContract from '../SmartContract';
import { Link } from 'react-router-dom';
const smartContract = SmartContract.getInstance();

const Home = () => {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await smartContract.getPosts();
                setPosts(posts);
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, []);
    return (
        <>
            <h1>Home</h1>
            {posts.map(post => (
                <article key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.public_text}</p>
                    <Link to={'/post/' + post.id}>Read More</Link>
                </article>
            ))}
        </>
    );
};

export default Home;