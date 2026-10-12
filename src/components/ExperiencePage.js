import React from 'react';
import Rich from './Rich';
import { EDUCATION, EXPERIENCE, SKILLS } from '../data/profile';

const ExperiencePage = () => (
    <main className="page">
        <header className="page-header">
            <h1>Experience</h1>
            <p className="lede">Scientific ML research, production speech systems, and building ML infrastructure from scratch.</p>
        </header>

        <section>
            {EXPERIENCE.map((job) => (
                <article key={job.org} className="entry">
                    <div className="entry-head">
                        <h2>
                            <a href={job.orgHref} target="_blank" rel="noreferrer">{job.org}</a>
                            {job.orgNote && <span className="meta"> · {job.orgNote}</span>}
                        </h2>
                        <span className="meta dates">{job.dates}</span>
                    </div>
                    <p className="entry-sub">{job.role} <span className="meta">· {job.location}</span></p>
                    <ul>
                        {job.bullets.map((parts, i) => (
                            <li key={i}><Rich parts={parts} /></li>
                        ))}
                    </ul>
                </article>
            ))}
        </section>

        <section>
            <h2 className="section-label">Education</h2>
            {EDUCATION.map((ed) => (
                <article key={ed.school} className="entry">
                    <div className="entry-head">
                        <h2><a href={ed.schoolHref} target="_blank" rel="noreferrer">{ed.school}</a></h2>
                        <span className="meta dates">{ed.dates}</span>
                    </div>
                    <p className="entry-sub">{ed.degree} <span className="meta">· {ed.detail} · {ed.location}</span></p>
                </article>
            ))}
        </section>

        <section>
            <h2 className="section-label">Skills</h2>
            <dl className="skills">
                {SKILLS.map((group) => (
                    <div key={group.label}>
                        <dt>{group.label}</dt>
                        <dd>
                            {group.items.map((item) => <span key={item} className="chip">{item}</span>)}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    </main>
);

export default ExperiencePage;
