import { useEffect, useState } from "react";
import {
    SIZE_CHART,
    HOW_TO_MEASURE,
    SIZE_GUIDE_NOTE,
} from "../data/sizeChart";
import "../styles/size-guide.css";

function SizeGuide({ onClose, highlightSize = "", defaultTab = "tops" }) {
    const [tab, setTab] = useState(defaultTab);
    const chart = SIZE_CHART[tab];

    useEffect(() => {
        function onKey(event) {
            if (event.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [onClose]);

    return (
        <div className="sg-overlay" onClick={onClose}>
            <div
                className="sg-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Size guide"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="sg-close"
                    onClick={onClose}
                    aria-label="Close size guide"
                >
                    ×
                </button>

                <p className="sg-eyebrow">Fit</p>
                <h2>Size guide</h2>

                <div className="sg-tabs" role="tablist">
                    {Object.entries(SIZE_CHART).map(([key, value]) => (
                        <button
                            type="button"
                            role="tab"
                            key={key}
                            aria-selected={tab === key}
                            className={tab === key ? "active" : ""}
                            onClick={() => setTab(key)}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>

                <div className="sg-table-wrap">
                    <table className="sg-table">
                        <thead>
                            <tr>
                                {chart.columns.map((column) => (
                                    <th key={column}>{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {chart.rows.map((row) => (
                                <tr
                                    key={row[0]}
                                    className={
                                        row[0] === highlightSize ? "sg-current" : ""
                                    }
                                >
                                    {row.map((cell, index) => (
                                        <td key={index}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3>How to measure</h3>
                <dl className="sg-measure">
                    {HOW_TO_MEASURE.map(([name, text]) => (
                        <div key={name}>
                            <dt>{name}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>

                <p className="sg-note">{SIZE_GUIDE_NOTE}</p>
            </div>
        </div>
    );
}

export default SizeGuide;
