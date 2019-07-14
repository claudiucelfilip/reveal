import React, { useState, useEffect, useContext } from 'react';
import SmartContract from '../SmartContract';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Html from './Html';

const Home = () => {
    const smartContract = useContext(SmartContract);
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await smartContract.getPosts();
                setPosts(posts);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [smartContract]);

    if (!smartContract.privateKey) {
        return <Redirect to="/login" />
    }
    return (
        <>
            <h1>Home</h1>
            <div className="row d-flex flex-wrap">
                {posts.map(post => (
                    <article className="col-md-4" key={post.id}>
                        <div className="content">
                            <h2>{post.title}</h2>
                            <Html content={post.public_text} />
                            <p>
                                <Link className="btn btn-secondary" to={'/post/' + post.id}>Read More</Link>
                            </p>

                        </div>
                    </article>
                ))}
            </div>
        </>
    );
};

export default observer(Home);