import React from 'react';

const CrpsBlog = () => {
    return (
        <article className="blog-card blog-article">
            <p className="blog-status">New</p>
            <h2>CRPS - Continuous Ranked Probability Score</h2>
            <p>
                CRPS generalizes MAE to probabilistic forecasts.
                It evaluates both closeness to observations and uncertainty quality.
            </p>

            <h3>Definition</h3>
            <p>
                Let X be a random variable and F its CDF, F(y) = P[X &lt;= y].
                Let x be the observed value.
            </p>
            <pre className="formula-block">
CRPS(F, x) = integral from -inf to +inf of (F(y) - 1(y - x))^2 dy
            </pre>
            <p>
                where 1(y - x) is the unit step (Heaviside) function.
                For deterministic forecasts, CRPS reduces to MAE.
            </p>

            <h3>Equivalent Form</h3>
            <pre className="formula-block">
CRPS(F, x) = E[|X - x|] - 0.5 E[|X - X'|]
            </pre>
            <p>
                X and X' are independent draws from F.
                E[.] denotes expectation.
            </p>

            <h3>Model Interpretation</h3>
            <ul>
                <li>X: one sample from the forecast distribution.</li>
                <li>X': another independent sample from the forecast distribution.</li>
                <li>x: the observed value from data.</li>
            </ul>

            <h3>Intuition: Calibration vs Sharpness</h3>
            <pre className="formula-block">
CRPS(F, x) = E|X - x| - 0.5 E|X - X'|
            </pre>
            <ul>
                <li>First term: calibration (forecast close to observation).</li>
                <li>Second term: sharpness/spread penalty balance.</li>
            </ul>

            <h3>Monte Carlo Estimation</h3>
            <p>When F is represented by samples x_i, CRPS is estimated as:</p>
            <pre className="formula-block">
CRPS(F, y) ~= (1/N) sum_i |x_i - y| - (1/(2N^2)) sum_i,j |x_i - x_j|
            </pre>
            <ul>
                <li>First term: skill (closeness to observation).</li>
                <li>Second term: spread (ensemble diversity).</li>
            </ul>

            <h3>MSE vs CRPS</h3>
            <p>
                MSE assumes a single deterministic prediction:
                MSE = E[(y_hat - y)^2].
                In irreducibly uncertain settings (for example, weather),
                MSE collapses forecasts toward the conditional mean.
            </p>
            <p>
                CRPS rewards getting both mean and uncertainty right.
                For a Gaussian forecast with mean mu and std sigma:
            </p>
            <pre className="formula-block">
CRPS(F, x) = sigma * [ z(2Phi(z)-1) + 2phi(z) - 1/sqrt(pi) ]
z = (x - mu) / sigma
            </pre>
            <p>
                If sigma is pushed too low, scores worsen when x != mu.
                Matching real uncertainty lowers average CRPS.
            </p>

            <h3>One World, Many Similar Situations</h3>
            <p>
                We do not need repeated draws at the exact same timestamp.
                Across geography and time there are many similar atmospheric setups,
                and their varying outcomes reveal the conditional distribution.
            </p>
            <p>
                Analogy: MSE predicts the average sky color at noon.
                CRPS models the distribution of sky colors.
            </p>
        </article>
    );
};

export default CrpsBlog;
