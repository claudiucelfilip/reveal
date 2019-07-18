import React, { useCallback, useState, useEffect, useContext, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import { navigate } from '@reach/router';
import ReactTags from 'react-tag-autocomplete';
import LoadingSpinner from './common/LoadingSpinner';
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],

    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                         // remove formatting button
    ['link', 'image', 'video'],
];

const Create = () => {
    const smartContract = useContext(SmartContract);
    const [loading, setLoading] = useState(false);
    const publicTextRef = useRef();
    const privateTextRef = useRef();
    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const quillPublicTextRef = useRef();
    const quillPrivateTextRef = useRef();
    const onSubmit = useCallback(async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            switch (key) {
                case 'price':
                    data[key] = parseInt(value);
                    break;
                default:
                    data[key] = value
            }
        });

        data.publicText = quillPublicTextRef.current.root.innerHTML;
        data.privateText = quillPrivateTextRef.current.root.innerHTML;
        data.tags = tags.map(tag => tag.name).join('|');

        setLoading(true);
        try {
            await smartContract.createPost(data);
            smartContract.notify('success', 'Your post has been published!');
            navigate('/');
            return;
        } catch (err) {
            smartContract.notify('danger', err.message);
        }
        setLoading(false);
    }, [smartContract, tags]);



    useEffect(() => {
        const fetchSuggestions = async () => {
            const tags = await smartContract.getTags();
            const newSuggestions = tags.reduce((acc, tag, index) => [...acc, { id: index, name: tag }], []);
            setSuggestions(newSuggestions);
        };

        fetchSuggestions();

        quillPublicTextRef.current = new Quill(publicTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'  // or 'bubble'
        });

        quillPrivateTextRef.current = new Quill(privateTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'  // or 'bubble'
        });
    }, [smartContract]);

    const onDelete = useCallback((i) => {
        const newTags = tags.slice(0);
        newTags.splice(i, 1);
        setTags(newTags);
    }, [tags]);

    const onAdd = useCallback((tag) => {
        const name = tag.name.trim().toLowerCase();
        if (!name.length) {
            return;
        }
        const newTags = [...tags, tag];
        setTags(newTags);
    }, [tags]);

    if (!smartContract.privateKey) {
        return <Redirect to="/login" />;
    }

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <>
            <h1>Create</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input className="form-control" type="text" name="title" />
                </div>

                <div className="form-group">
                    <label>Excerpt</label>
                    <textarea className="form-control large-textarea" name="excerpt" />
                </div>
                <div className="form-group">
                    <label>Public Text</label>

                    {/* <textarea  name="publicText" /> */}
                    <div id="publicText" ref={publicTextRef} />
                </div>
                <div className="form-group">
                    <label>Private Text</label>
                    {/* <textarea name="privateText" /> */}
                    <div id="privateText" ref={privateTextRef} />
                </div>
                <div className="row">
                    <div className="form-group col col-md-6">
                        <label>Price</label>
                        <input className="form-control" type="text" name="price" defaultValue={10000} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Tags</label>
                    <ReactTags
                        autofocus={false}
                        tags={tags}
                        delimiters={[188]}
                        allowNew={true}
                        addOnBlur={true}
                        suggestions={suggestions}
                        handleDelete={onDelete}
                        minQueryLength={0}
                        maxSuggestionsLength={suggestions.length}
                        placeholder="Add comma separated tags"
                        handleAddition={onAdd} />
                </div>
                
                <div className="form-group mt-4">
                    <p>There's a fixed 10,000 PERLs plus a per character fee to Publish a Post.</p>
                    <button className="btn btn-primary" type="submit">Publish</button>
                </div>
            </form>
        </>
    );
};

export default observer(Create);