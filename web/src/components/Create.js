import React, { useCallback, useState, useEffect, useContext, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import SmartContract from '../SmartContract';
import { observer } from 'mobx-react-lite';
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';


const Create = ({ history }) => {
    const smartContract = useContext(SmartContract);
    const [loading, setLoading] = useState(false);
    const publicTextRef = useRef();
    const privateTextRef = useRef();

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

        setLoading(true);
        try {
            await smartContract.createPost(data);
            history.push('/');
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [smartContract, history]);

    

    useEffect(() => {
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
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

        quillPublicTextRef.current = new Quill(publicTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'  // or 'bubble'
        });

        quillPrivateTextRef.current = new Quill(privateTextRef.current, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'  // or 'bubble'
        });
    }, []);

    if (!smartContract.privateKey) {
        return <Redirect to="/login" />
    }

    if (loading) {
        return <h3>loading...</h3>;
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
                <div className="form-group">
                    <label>Price</label>
                    <input className="form-control" type="text" name="price" defaultValue={1000000} />
                </div>
                <div className="form-group">
                    <button className="btn btn-primary" type="submit">Create</button>
                </div>
            </form>
        </>
    );
};

export default observer(Create);