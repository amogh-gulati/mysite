// Single source of truth for site content. Rich text fields are arrays of
// strings, { text, href } links, and { strong } emphasis (see components/Rich.js).

export const LAST_UPDATED = 'October 2026';

export const PROFILE = {
    name: 'Amogh Gulati',
    tagline: 'ML engineer & researcher',
    location: 'New York, NY',
    email: 'ag11542@nyu.edu',
};

export const LINKS = [
    { label: 'CV', href: '/cv.pdf' },
    { label: 'Email', href: `mailto:${PROFILE.email}` },
    { label: 'GitHub', href: 'https://github.com/amogh-gulati' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/amogh-gulati' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=3R23LMAAAAAJ' },
];

const SAMUDRA = { text: 'Samudra', href: 'https://github.com/m2lines/Samudra' };
const SAMSUNG = { text: 'Samsung', href: 'https://www.youtube.com/watch?v=bsAu_GSFEXM' };
const CADBURY = { text: 'Cadbury', href: 'https://www.youtube.com/watch?v=uvzX71ff2pg' };

export const EXPERIENCE = [
    {
        org: 'M²LInES, NYU Courant',
        orgHref: 'https://m2lines.github.io/',
        role: 'Graduate Research Assistant',
        location: 'New York, NY',
        dates: 'Oct 2025 – Present',
        bullets: [
            [
                'Improved ', SAMUDRA, ', an ML ocean emulator: skip-connection dropout reduced rollout RMSE by up to ',
                { strong: '15%' }, ' on velocity and ', { strong: '8.5%' },
                ' on sea surface height; ConvNeXt–axial attention blocks reduced RMSE across all variables and depths.',
            ],
            ['Developing replay-buffer training and spectral losses to address spatial smoothing and long-term trend errors in 100-year ocean rollouts.'],
        ],
    },
    {
        org: 'Gan.ai',
        orgHref: 'https://gan.ai',
        orgNote: 'Sequoia-backed',
        role: 'Founding ML Engineer',
        location: 'Noida, India',
        dates: 'Jan 2021 – Oct 2024',
        bullets: [
            ["Built and owned the company's ML stack from scratch, spanning TTS model training, production inference, and deployment; led the ML infrastructure team."],
            ['Trained and deployed TTS models (NaturalSpeech2, FastSpeech2, Tortoise) for English and 6 Indic languages, serving ', { strong: '200k+ daily inferences' }, '.'],
            ['Designed AWS deployment pipelines using Lambda, SageMaker, Docker, and ONNX, reducing cold-start latency from ', { strong: '60s to 4s' }, '.'],
            ['Owned delivery of personalized video ads for ', SAMSUNG, ' and AI-generated birthday songs for ', CADBURY, '.'],
            ["Established security and operational processes and compiled audit evidence for the company's ", { strong: 'SOC 2 Type II' }, ' compliance.'],
            ['Co-inventor on ', { strong: '2 pending US patent applications' }, ' for AI voice-over and multimedia generation.'],
        ],
    },
    {
        org: 'Precog Research Group, IIIT Delhi',
        orgHref: 'https://precog.iiit.ac.in/',
        role: 'Undergraduate Researcher',
        location: 'New Delhi, India',
        dates: 'Jun 2019 – Jan 2021',
        bullets: [
            ['Built ELK pipelines to automate collection of ', { strong: '100M+ tweets' }, ' for social media research.'],
            ['Analyzed emotions and misinformation in COVID-19 and political discussions on social media, resulting in ', { text: 'publications', href: '/research' }, '.'],
        ],
    },
    {
        org: 'Qualcomm',
        orgHref: 'https://www.qualcomm.com',
        role: 'Software Engineering Intern',
        location: 'Remote',
        dates: 'May 2020 – Aug 2020',
        bullets: [
            ['Extended debugging features in the Hexagon IDE and automated build-goal validation with Python.'],
        ],
    },
];

export const EDUCATION = [
    {
        school: 'NYU Courant Institute of Mathematical Sciences',
        schoolHref: 'https://cs.nyu.edu',
        degree: 'M.S. Computer Science',
        detail: 'GPA 3.8/4.0',
        location: 'New York, NY',
        dates: 'Sep 2025 – May 2027',
    },
    {
        school: 'IIIT Delhi',
        schoolHref: 'https://www.iiitd.ac.in',
        degree: 'B.Tech. Computer Science and Engineering',
        detail: 'GPA 8.71/10',
        location: 'New Delhi, India',
        dates: 'Aug 2017 – May 2021',
    },
];

export const SKILLS = [
    { label: 'Languages', items: ['Python', 'C++', 'SQL', 'Bash'] },
    { label: 'ML & Data', items: ['PyTorch (DDP)', 'ONNX', 'Weights & Biases', 'Xarray', 'Zarr', 'Pandas', 'NumPy'] },
    { label: 'Infrastructure', items: ['Slurm', 'Docker', 'AWS (Lambda, SageMaker, S3, SQS, CloudFront)', 'Elasticsearch', 'Kibana'] },
];

// `authors` uses "*" to mark self so it can be emphasized.
export const PUBLICATIONS = [
    {
        title: 'Rethinking MUSHRA: Addressing Modern Challenges in Text-to-Speech Evaluation',
        authors: 'Varadhan, P. S., *Gulati, A.*, Sankar, A., Anand, S., et al.',
        venue: 'TMLR',
        year: 2025,
        href: 'https://arxiv.org/abs/2411.12719',
        linkLabel: 'arXiv',
        selected: true,
    },
    {
        title: 'Psychometric Analysis and Coupling of Emotions Between State Bulletins and Twitter in India During COVID-19 Infodemic',
        authors: 'Aggrawal, P., Jolly, B. L. K., *Gulati, A.*, et al.',
        venue: 'Frontiers in Communication',
        year: 2021,
        href: 'https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2021.695913/full',
        linkLabel: 'Paper',
        selected: true,
    },
    {
        title: 'Capitol (Pat)riots: A Comparative Study of Twitter and Parler',
        authors: 'Prabhu, A., Guhathakurta, D., Subramanian, M., Reddy, M., Sehgal, S., Karandikar, T., *Gulati, A.*, et al.',
        venue: 'arXiv:2101.06914',
        year: 2021,
        href: 'https://arxiv.org/abs/2101.06914',
        linkLabel: 'arXiv',
    },
    {
        title: "It's Not What They Play, It's What You Hear: Understanding Perceived vs. Induced Emotions in Hindustani Classical Music",
        authors: '*Gulati, A.*, Joshi, B., Jain, C., and Shukla, J.',
        venue: "ICMI '20 Companion",
        year: 2020,
    },
];

export const PATENTS = [
    {
        title: 'Voiced-over Multimedia Track Generation',
        authors: '*Gulati, A.*, Siddhartha, S., Barman, M. P., Bhatia, A., and Bhooshan, S.',
        venue: 'US Patent App. 18/842,687 (pending)',
        year: 2025,
        href: 'https://patents.google.com/patent/US20250210065A1/en',
        linkLabel: 'Google Patents',
    },
    {
        title: 'Seamless Multimedia Integration',
        authors: 'Siddhartha, S., Bhatia, A., *Gulati, A.*, Barman, M. P., and Bhooshan, S.',
        venue: 'US Patent App. 19/242,615 (pending)',
        year: 2025,
        href: 'https://patents.google.com/patent/US20250317628A1/en',
        linkLabel: 'Google Patents',
    },
];

export const SCHOLAR_URL = LINKS.find((l) => l.label === 'Google Scholar').href;
