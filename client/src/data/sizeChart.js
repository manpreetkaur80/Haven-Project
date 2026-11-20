// EDIT ME — the size guide on every product page reads from this file.
//
// These are general BODY measurements in inches, a starting point only.
// Replace them with the measurements of your real garments/fits.
// Add or remove rows freely; columns come from `columns`.

export const SIZE_CHART = {
    tops: {
        label: "Tops",
        columns: ["Size", "Chest", "Waist", "Shoulder"],
        rows: [
            ["XS", "32–34", "26–28", "14.5"],
            ["S", "35–37", "29–31", "15.5"],
            ["M", "38–40", "32–34", "16.5"],
            ["L", "41–43", "35–37", "17.5"],
            ["XL", "44–46", "38–40", "18.5"],
            ["XXL", "47–49", "41–43", "19.5"],
        ],
    },
    bottoms: {
        label: "Bottoms",
        columns: ["Size", "Waist", "Hip", "Inseam"],
        rows: [
            ["XS", "26–28", "34–36", "29"],
            ["S", "29–31", "37–39", "30"],
            ["M", "32–34", "40–42", "31"],
            ["L", "35–37", "43–45", "32"],
            ["XL", "38–40", "46–48", "32"],
            ["XXL", "41–43", "49–51", "33"],
        ],
    },
};

export const HOW_TO_MEASURE = [
    ["Chest", "Around the fullest part of your chest, arms relaxed at your sides."],
    ["Waist", "Around your natural waistline, the narrowest part of your torso."],
    ["Hip", "Around the fullest part of your hips, feet together."],
    ["Shoulder", "Across the back, from one shoulder edge to the other."],
    ["Inseam", "From the top of your inner thigh down to your ankle."],
];

export const SIZE_GUIDE_NOTE =
    "Measurements are body measurements in inches and are a general guide — fit varies by style. Between sizes? Size up for a relaxed fit.";
