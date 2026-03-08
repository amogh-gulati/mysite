import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Notebook.css';

const AXIS_TICKS = 10;
const g = 9.8;
const BALL_RADIUS = 10;

const Notebook = () => {
    const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
    const [scrollProgress, setScrollProgress] = useState(0);

    const sceneRef = useRef();

    useEffect(() => {
        const updateScrollProgress = () => {
            const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            const value = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
            setScrollProgress(value);
        };

        updateScrollProgress();
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
        };
    }, []);

    useEffect(() => {
        const updateSceneSize = () => {
            if (!sceneRef.current) return;
            const rect = sceneRef.current.getBoundingClientRect();
            setSceneSize({
                width: rect.width,
                height: rect.height,
            });
        };

        updateSceneSize();
        window.addEventListener('resize', updateSceneSize);
        return () => window.removeEventListener('resize', updateSceneSize);
    }, []);

    const geometry = useMemo(() => {
        const width = Math.max(sceneSize.width, 320);
        const height = Math.max(sceneSize.height, 360);

        const leftMargin = Math.max(28, width * 0.06);
        const rightMargin = Math.max(24, width * 0.03);
        const topMargin = Math.max(24, Math.min(48, height * 0.04));
        const bottomMargin = Math.max(BALL_RADIUS + 6, height * 0.02);

        const startX = leftMargin;
        const startY = topMargin;
        const endX = width - rightMargin;
        const endY = height - bottomMargin;

        const lineDx = endX - startX;
        const lineDy = endY - startY;
        const lineLength = Math.hypot(lineDx, lineDy);
        const lineAcceleration = lineLength > 0 ? g * (lineDy / lineLength) : g;

        // Keep cycloid-like ball faster than straight-line ball while sharing endpoints.
        const tLineTotal = Math.sqrt((2 * lineLength) / lineAcceleration);
        const tCurveTotal = tLineTotal * 0.8;
        const tMax = Math.max(tCurveTotal, tLineTotal);

        return {
            width,
            height,
            startX,
            startY,
            endX,
            endY,
            lineDx,
            lineDy,
            lineLength,
            lineAcceleration,
            tCurveTotal,
            tLineTotal,
            tMax,
        };
    }, [sceneSize]);

    const elapsed = scrollProgress * geometry.tMax;

    const animationProgress = scrollProgress;

    const getCurvePosition = (time) => {
        const progress = geometry.tCurveTotal > 0 ? Math.min(time / geometry.tCurveTotal, 1) : 0;
        const theta = progress * Math.PI;

        const cycloidX = (theta - Math.sin(theta)) / Math.PI;
        const cycloidY = (1 - Math.cos(theta)) / 2;

        const x = geometry.startX + (geometry.lineDx * cycloidX);
        const y = geometry.startY + (geometry.lineDy * cycloidY);
        return { x, y };
    };

    const getLinearPosition = (time) => {
        const s = Math.min(0.5 * geometry.lineAcceleration * time * time, geometry.lineLength);
        const progress = Math.min(s / geometry.lineLength, 1);
        const x = geometry.startX + geometry.lineDx * progress;
        const y = geometry.startY + geometry.lineDy * progress;
        return { x, y };
    };

    const curvePosition = getCurvePosition(elapsed);
    const linearPosition = getLinearPosition(elapsed);

    const connectorDx = linearPosition.x - curvePosition.x;
    const connectorDy = linearPosition.y - curvePosition.y;
    const connectorLength = Math.hypot(connectorDx, connectorDy);
    const connectorAngle = Math.atan2(connectorDy, connectorDx) * (180 / Math.PI);

    const ballDistance = Math.hypot(connectorDx, connectorDy);
    const overlapRatio = Math.max(0, 1 - (ballDistance / (BALL_RADIUS * 2)));
    const overlapSize = Math.max(0, overlapRatio * BALL_RADIUS * 2);
    const overlapCenterX = (curvePosition.x + linearPosition.x) / 2;
    const overlapCenterY = (curvePosition.y + linearPosition.y) / 2;

    const xLabels = Array.from({ length: AXIS_TICKS + 1 }, (_, i) => i);
    const yLabels = Array.from({ length: AXIS_TICKS + 1 }, (_, i) => i);

    const neuralNetwork = useMemo(() => {
        const layerSizes = [4, 6, 5, 3];
        const layers = layerSizes.length;

        const isNarrow = geometry.width <= 768;

        const networkWidth = isNarrow
            ? Math.min(Math.max(300, geometry.width * 0.58), 420)
            : Math.min(Math.max(550, geometry.width * 0.7), 800);
        const networkHeight = isNarrow
            ? Math.min(Math.max(260, geometry.height * 0.42), 380)
            : Math.min(Math.max(450, geometry.height * 0.65), 650);

        // Place the network near the lower merge region, slightly above-left of the endpoint.
        const targetLeft = geometry.endX - networkWidth - (isNarrow ? Math.max(44, geometry.width * 0.05) : Math.max(70, geometry.width * 0.08));
        const targetTop = geometry.endY - networkHeight - (isNarrow ? Math.max(44, geometry.height * 0.06) : Math.max(90, geometry.height * 0.12));

        // On phones, keep the diagram in the lower area to avoid text collisions.
        const minTop = isNarrow ? Math.max(geometry.height * 0.58, geometry.startY + 120) : geometry.startY + 40;

        const left = Math.min(
            Math.max(targetLeft, 20),
            Math.max(20, geometry.width - networkWidth - 20)
        );
        const top = Math.min(
            Math.max(targetTop, minTop),
            Math.max(minTop, geometry.height - networkHeight - 80)
        );

        const nodesByLayer = layerSizes.map((size, layerIndex) => {
            const x = left + ((layerIndex / (layers - 1)) * networkWidth);
            return Array.from({ length: size }, (_, nodeIndex) => {
                const y = top + (((nodeIndex + 1) / (size + 1)) * networkHeight);
                return {
                    id: `${layerIndex}-${nodeIndex}`,
                    layerIndex,
                    x,
                    y,
                };
            });
        });

        const edges = [];
        for (let layer = 0; layer < nodesByLayer.length - 1; layer++) {
            for (const from of nodesByLayer[layer]) {
                for (const to of nodesByLayer[layer + 1]) {
                    edges.push({
                        id: `${from.id}->${to.id}`,
                        x1: from.x,
                        y1: from.y,
                        x2: to.x,
                        y2: to.y,
                    });
                }
            }
        }

        const nodes = nodesByLayer.flat();
        return { nodes, edges, lastLayer: layers - 1 };
    }, [geometry]);

    const getXLabelPosition = (index) => {
        const ratio = index / AXIS_TICKS;
        return geometry.startX + ((geometry.endX - geometry.startX) * ratio);
    };

    const getYLabelPosition = (index) => {
        const ratio = index / AXIS_TICKS;
        return geometry.startY + ((geometry.endY - geometry.startY) * ratio);
    };

    return (
        <div className='notebook-container'>
            <div ref={sceneRef} className="lines-container">
                <div className="scene-info">
                    <h2>Amogh Gulati</h2>
                    <p>Hi, I am Amogh. I write code.</p>
                    <p className="last-update">Last update: March 7, 2026</p>
                    <p className="physics-info">
                        New York, US | ag11542@nyu.edu | +1 (929) 363 7577<br />
                        <a href="https://github.com/amogh-gulati" target="_blank" rel="noreferrer">GitHub</a> | <a href="https://linkedin.com/in/amogh-gulati" target="_blank" rel="noreferrer">LinkedIn</a>
                    </p>
                </div>

                <div className="notes-textarea">
                    <h3>Welcome</h3>
                    <p>
                        I am currently pursuing an MS in Computer Science at NYU Courant.
                        My background spans startup ML engineering and academic research,
                        from large-scale multilingual speech systems to climate-focused scientific modeling.
                    </p>

                    <h3>What I Work On</h3>
                    <ul>
                        <li>Production ML and MLOps: deploying models that can scale and stay maintainable.</li>
                        <li>Scientific ML: building interpretable models for physical systems and climate applications.</li>
                        <li>Applied AI research: evaluation, metrics, and model reliability in real-world settings.</li>
                    </ul>

                    <h3>Explore</h3>
                    <p>
                        Use the tabs above to view detailed experience and upcoming blog posts.
                    </p>
                </div>

                <div className="animation-overlay">
                    <svg
                        className="nn-diagram"
                        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                        preserveAspectRatio="none"
                    >
                        {neuralNetwork.edges.map((edge) => (
                            <line
                                key={edge.id}
                                className="nn-edge"
                                x1={edge.x1}
                                y1={edge.y1}
                                x2={edge.x2}
                                y2={edge.y2}
                            />
                        ))}
                        {neuralNetwork.nodes.map((node) => (
                            <circle
                                key={node.id}
                                className={`nn-node ${
                                    node.layerIndex === 0
                                        ? 'nn-node-input'
                                        : node.layerIndex === neuralNetwork.lastLayer
                                            ? 'nn-node-output'
                                            : 'nn-node-hidden'
                                }`}
                                cx={node.x}
                                cy={node.y}
                                r="6"
                            />
                        ))}
                    </svg>

                    <div className="y-axis">
                        <div className="axis-line y-line" style={{ left: `${geometry.endX}px` }}></div>
                        <div className="y-labels">
                            {yLabels.map((label, index) => (
                                <span
                                    key={index}
                                    className="axis-label y-label"
                                    style={{ top: `${getYLabelPosition(index)}px`, left: `${geometry.endX + 10}px` }}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        className="rolling-ball curve-ball"
                        style={{ transform: `translate(${curvePosition.x - BALL_RADIUS}px, ${curvePosition.y - BALL_RADIUS}px)` }}
                    />
                    <div
                        className="rolling-ball linear-ball"
                        style={{ transform: `translate(${linearPosition.x - BALL_RADIUS}px, ${linearPosition.y - BALL_RADIUS}px)` }}
                    />

                    <div
                        className="ball-connector"
                        style={{
                            width: `${connectorLength}px`,
                            transform: `translate(${curvePosition.x}px, ${curvePosition.y}px) rotate(${connectorAngle}deg)`
                        }}
                    />

                    {overlapSize > 0 && (
                        <div
                            className="ball-overlap-merge"
                            style={{
                                width: `${overlapSize}px`,
                                height: `${overlapSize}px`,
                                transform: `translate(${overlapCenterX - (overlapSize / 2)}px, ${overlapCenterY - (overlapSize / 2)}px)`
                            }}
                        />
                    )}

                    <div className="start-point" style={{ top: `${geometry.startY}px`, left: `${geometry.startX}px` }}>
                        <span>Start</span>
                        <span className="start-time">t=0</span>
                    </div>
                </div>
            </div>

            <div className="bottom-hud">
                <div className="floating-axis">
                    <div
                        className="axis-line x-line"
                        style={{ left: `${geometry.startX}px`, width: `${Math.max(geometry.endX - geometry.startX, 0)}px` }}
                    ></div>
                    <div className="x-labels">
                        {xLabels.map((label, index) => (
                            <span
                                key={index}
                                className="axis-label x-label"
                                style={{ left: `${getXLabelPosition(index)}px` }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                    <span className="x-axis-caption" style={{ left: `${geometry.endX + 8}px` }}>X</span>
                </div>

                <div className="scroll-indicator">
                    <div className="scroll-progress-bar">
                        <div className="progress-fill" style={{ width: `${animationProgress * 100}%` }}></div>
                    </div>
                    <div className="time-label">t = {elapsed.toFixed(2)} s</div>
                </div>
            </div>
        </div>
    );
};

export default Notebook;
