import "../styles/service-strip.css";

const icon = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.1,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
};

/* Copy below matches what the store does today: COD checkout and returns. */
const ITEMS = [
    {
        title: "Cash on delivery",
        text: "Pay when your order arrives.",
        icon: (
            <svg {...icon}>
                <rect x="3" y="7" width="18" height="10" rx="1" />
                <circle cx="12" cy="12" r="2.3" />
                <path d="M6.5 10v4M17.5 10v4" />
            </svg>
        ),
    },
    {
        title: "Easy returns",
        text: "Request a return from your account.",
        icon: (
            <svg {...icon}>
                <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
                <path d="M20 4v4.5h-4.5" />
                <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
                <path d="M4 20v-4.5h4.5" />
            </svg>
        ),
    },
    {
        title: "Everyday essentials",
        text: "Timeless pieces, edited each season.",
        icon: (
            <svg {...icon}>
                <path d="M12 6.5a1.8 1.8 0 1 1 1.8 1.8c-1 .3-1.8 1-1.8 2v.7" />
                <path d="M12 11 3.5 17.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 11Z" />
            </svg>
        ),
    },
];

function ServiceStrip() {
    return (
        <section className="haven-services" aria-label="Why shop with HAVEN">
            <ul>
                {ITEMS.map((item) => (
                    <li key={item.title}>
                        {item.icon}
                        <div>
                            <h2>{item.title}</h2>
                            <p>{item.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default ServiceStrip;
