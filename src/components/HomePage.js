import React from 'react';
import { Link } from 'react-router-dom';
import Brachistochrone, { RaceResults } from './Brachistochrone';
import { SmartLink } from './Rich';
import OffTheClock from './OffTheClock';
import { BLOGS } from './BlogsTab';
import { EXPERIENCE, LAST_UPDATED, LINKS, PROFILE, PUBLICATIONS } from '../data/profile';

const [current, previous] = EXPERIENCE;

const HomePage = () => (
    <Brachistochrone className="home">
        {(race) => (
            <div className="page home-content">
                <section className="hero">
                    <div className="hero-art" role="img" aria-label="Line drawing of an amoeba surrounded by small doodles: a galaxy, moon, star, eye, leaf, heart, mountains and waves" />
                    <h1>{PROFILE.name}</h1>
                    <p className="lede">
                        ML engineer and researcher. I&rsquo;m doing an M.S. in Computer Science at{' '}
                        <a href="https://cs.nyu.edu" target="_blank" rel="noreferrer">NYU Courant</a> and working on
                        ML ocean emulators at{' '}
                        <a href={current.orgHref} target="_blank" rel="noreferrer">M²LInES</a>. Before that I spent
                        almost four years as the founding ML engineer at{' '}
                        <a href={previous.orgHref} target="_blank" rel="noreferrer">Gan.ai</a>, building speech
                        models that served 200k+ inferences a day.
                    </p>
                    <ul className="link-row">
                        {LINKS.map((link) => (
                            <li key={link.label}>
                                <SmartLink href={link.href}>{link.label}</SmartLink>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="section-label">Now</h2>
                    <p>
                        Improving{' '}
                        <a href="https://github.com/m2lines/Samudra" target="_blank" rel="noreferrer">Samudra</a>, an ML
                        emulator of the global ocean. Skip-connection dropout cut rollout RMSE by up to 15% on
                        velocity, and I&rsquo;m now working on replay-buffer training and spectral losses to keep
                        100-year rollouts sharp and on-trend.
                    </p>
                </section>

                <section>
                    <h2 className="section-label">Before</h2>
                    <p>
                        At Gan.ai I built the ML stack from scratch: TTS training (NaturalSpeech2, FastSpeech2,
                        Tortoise) for English and six Indic languages, and AWS inference pipelines that cut
                        cold-start from 60s to 4s. That work shipped as personalized video ads for{' '}
                        <a href="https://www.youtube.com/watch?v=bsAu_GSFEXM" target="_blank" rel="noreferrer">Samsung</a>{' '}
                        and AI-generated birthday songs for{' '}
                        <a href="https://www.youtube.com/watch?v=uvzX71ff2pg" target="_blank" rel="noreferrer">Cadbury</a>,
                        and two pending US patents.
                    </p>
                    <p><Link to="/experience" className="more">Full experience →</Link></p>
                </section>

                <section>
                    <h2 className="section-label">Selected papers</h2>
                    <ul className="plain-list">
                        {PUBLICATIONS.filter((p) => p.selected).map((p) => (
                            <li key={p.title}>
                                <a href={p.href} target="_blank" rel="noreferrer">{p.title}</a>
                                <span className="meta"> · {p.venue} {p.year}</span>
                            </li>
                        ))}
                    </ul>
                    <p><Link to="/research" className="more">All papers & patents →</Link></p>
                </section>

                <section>
                    <h2 className="section-label">Writing</h2>
                    <ul className="plain-list">
                        {BLOGS.map((b) => (
                            <li key={b.slug}>
                                <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                                <span className="meta"> · {b.summary}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <OffTheClock />

                <RaceResults race={race} />

                <p className="meta updated">Last updated {LAST_UPDATED}.</p>
            </div>
        )}
    </Brachistochrone>
);

export default HomePage;
