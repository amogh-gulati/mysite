import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <main className="page">
        <header className="page-header">
            <h1>Off the graph</h1>
            <p className="lede">Nothing lives at this address. <Link to="/">Head back home</Link>.</p>
        </header>
    </main>
);

export default NotFound;
