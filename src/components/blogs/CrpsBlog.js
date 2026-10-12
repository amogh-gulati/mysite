import React from 'react';

const Formula = ({ children }) => <pre className="formula">{children}</pre>;

const CrpsBlog = () => (
    <article className="post">
        <h1>CRPS: the Continuous Ranked Probability Score</h1>
        <p className="lede">
            CRPS generalizes mean absolute error to probabilistic forecasts. It scores both how close a
            forecast is to what happened and how well it captures uncertainty.
        </p>

        <h2>Definition</h2>
        <p>
            Let X be a random variable with CDF F, so F(y) = P[X ≤ y], and let x be the observed value.
        </p>
        <Formula>CRPS(F, x) = ∫ ( F(y) − 𝟙{'{'}y ≥ x{'}'} )² dy     over y ∈ (−∞, ∞)</Formula>
        <p>
            𝟙{'{'}y ≥ x{'}'} is the Heaviside step at the observation. For a deterministic forecast (F is a
            step function itself) CRPS reduces to MAE.
        </p>

        <h2>Equivalent form</h2>
        <Formula>CRPS(F, x) = E|X − x| − ½ E|X − X′|</Formula>
        <ul>
            <li>X, X′: two independent samples from the forecast distribution F.</li>
            <li>x: the observed value.</li>
        </ul>

        <h2>Intuition: calibration vs. sharpness</h2>
        <ul>
            <li><strong>E|X − x|</strong> rewards forecasts that land close to the observation.</li>
            <li><strong>−½ E|X − X′|</strong> credits spread, so the forecast isn&rsquo;t pushed to collapse onto a single point.</li>
        </ul>

        <h2>Monte Carlo estimate</h2>
        <p>With an ensemble of N samples x₁ … x_N and observation y:</p>
        <Formula>CRPS ≈ (1/N) Σᵢ |xᵢ − y|  −  (1/2N²) Σᵢ Σⱼ |xᵢ − xⱼ|</Formula>
        <ul>
            <li>First term: skill, how close members are to the observation.</li>
            <li>Second term: spread, the diversity of the ensemble.</li>
        </ul>

        <h2>MSE vs. CRPS</h2>
        <p>
            MSE = E[(ŷ − y)²] assumes a single deterministic prediction. In settings with irreducible
            uncertainty, like weather, minimizing MSE collapses forecasts toward the conditional mean and
            produces blurry fields.
        </p>
        <p>CRPS rewards getting both the mean and the uncertainty right. For a Gaussian forecast N(μ, σ²):</p>
        <Formula>{`CRPS = σ · [ z (2Φ(z) − 1) + 2φ(z) − 1/√π ],   z = (x − μ) / σ`}</Formula>
        <p>
            Push σ too low and the score worsens whenever x ≠ μ. Matching the true uncertainty minimizes
            average CRPS.
        </p>

        <h2>One world, many similar situations</h2>
        <p>
            We never observe repeated draws at the same timestamp. But across geography and time there are
            many similar atmospheric setups, and their varied outcomes reveal the conditional distribution.
        </p>
        <p>
            An analogy: MSE predicts the average sky color at noon. CRPS models the distribution of sky
            colors.
        </p>
    </article>
);

export default CrpsBlog;
