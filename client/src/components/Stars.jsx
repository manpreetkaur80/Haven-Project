/* Read-only star rating drawn with thin outlines. */
function Stars({ value = 0, size = 14 }) {
    const rounded = Math.round(value);

    return (
        <span
            className="haven-stars"
            role="img"
            aria-label={`${value} out of 5 stars`}
            style={{ display: "inline-flex", gap: 2, color: "#2a2723" }}
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <svg
                    key={n}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={n <= rounded ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="m12 3.2 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3.2Z" />
                </svg>
            ))}
        </span>
    );
}

export default Stars;
