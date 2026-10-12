import React from 'react';
import { Authors } from './Rich';
import { PATENTS, PUBLICATIONS, SCHOLAR_URL } from '../data/profile';

const Item = ({ item }) => (
    <li className="pub">
        <span className="pub-year">{item.year}</span>
        <div>
            <p className="pub-title">
                {item.href
                    ? <a href={item.href} target="_blank" rel="noreferrer">{item.title}</a>
                    : item.title}
            </p>
            <p className="meta"><Authors authors={item.authors} /></p>
            <p className="meta">
                <em>{item.venue}</em>
                {item.href && (
                    <> · <a href={item.href} target="_blank" rel="noreferrer">{item.linkLabel}</a></>
                )}
            </p>
        </div>
    </li>
);

const ResearchPage = () => (
    <main className="page">
        <header className="page-header">
            <h1>Research</h1>
            <p className="lede">
                Papers on speech evaluation and computational social science, and patents from my time at Gan.ai.
                Citations on <a href={SCHOLAR_URL} target="_blank" rel="noreferrer">Google Scholar</a>.
            </p>
        </header>

        <section>
            <h2 className="section-label">Publications</h2>
            <ul className="pub-list">{PUBLICATIONS.map((p) => <Item key={p.title} item={p} />)}</ul>
        </section>

        <section>
            <h2 className="section-label">Patents</h2>
            <ul className="pub-list">{PATENTS.map((p) => <Item key={p.title} item={p} />)}</ul>
        </section>
    </main>
);

export default ResearchPage;
