import React from 'react';

const ExperienceTab = () => {
    return (
        <main className="tab-page experience-page">
            <section className="page-hero">
                <h1>Experience</h1>
                <p>Research, production ML systems, and engineering leadership across academia and startups.</p>
            </section>

            <section className="timeline-card">
                <h2>M2LInES, NYU Courant</h2>
                <p className="role-meta">Research Assistant | Oct 2024 - Present | New York, US</p>
                <ul>
                    <li>Contributing to interpretable ML models for climate projections in air-sea-ice systems.</li>
                    <li>Processing large climate datasets (Samudra, OM4) with Python, xarray, Zarr, and HPC workflows.</li>
                    <li>Designing and evaluating AI models for ocean-atmosphere coupling with domain-specific metrics.</li>
                </ul>
            </section>

            <section className="timeline-card">
                <h2>Gan.ai (backed by Sequoia)</h2>
                <p className="role-meta">Founding Machine Learning Engineer (Employee #2) | Jan 2021 - Oct 2024 | Noida, India</p>
                <ul>
                    <li>Built and deployed TTS systems (NaturalSpeech2, FastSpeech2, Tortoise) for English and 6 Indic languages.</li>
                    <li>Shipped systems powering 200k+ daily inferences in production.</li>
                    <li>Built AWS MLOps pipelines (Lambda, SageMaker, Docker, ONNX), reducing cold-start latency by 90%.</li>
                    <li>Led a 5-member ML engineering team and drove SOC 2 Type II compliance.</li>
                </ul>
            </section>

            <section className="timeline-card">
                <h2>Precog Research Group, IIIT Delhi</h2>
                <p className="role-meta">Undergraduate Researcher | Jun 2019 - Jan 2021 | New Delhi, India</p>
                <ul>
                    <li>Designed ELK pipelines for social-media mining at 100M+ tweet scale.</li>
                    <li>Published research on emotion and misinformation in COVID-19 and political discourse datasets.</li>
                </ul>
            </section>

            <section className="timeline-card split-grid">
                <article>
                    <h2>Qualcomm</h2>
                    <p className="role-meta">Software Engineering Intern | May 2020 - Aug 2020 | Remote</p>
                    <ul>
                        <li>Extended Hexagon IDE debugging functionality.</li>
                        <li>Built Python automation for build-goal validation.</li>
                    </ul>
                </article>
                <article>
                    <h2>Teaching Assistant, IIIT Delhi</h2>
                    <p className="role-meta">ML and Open Source Software Development | Aug 2020 - May 2021</p>
                    <ul>
                        <li>Supported 200+ students through tutorials, grading, and office hours.</li>
                    </ul>
                </article>
            </section>
        </main>
    );
};

export default ExperienceTab;
