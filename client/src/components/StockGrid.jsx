const splitList = (value) =>
    String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const keyOf = (size, color) => `${size}|${color}`;

/** Builds the array the API expects from the sizes, colours and typed-in numbers. */
export function buildVariants(sizesText, colorsText, stockMap) {
    const sizes = splitList(sizesText);
    const colors = splitList(colorsText);
    const rows = sizes.length ? sizes : [""];
    const cols = colors.length ? colors : [""];

    return rows.flatMap((size) =>
        cols.map((color) => ({
            size,
            color,
            stock: Math.max(0, parseInt(stockMap[keyOf(size, color)], 10) || 0),
        }))
    );
}

/**
 * Turns a saved product into the editable grid values. Older products that
 * only had one total are spread evenly across their combinations.
 */
export function stockMapFromProduct(product) {
    const map = {};

    if (product.variants?.length) {
        product.variants.forEach((v) => {
            map[keyOf(v.size, v.color)] = String(v.stock);
        });
        return map;
    }

    const sizes = product.sizes?.length ? product.sizes : [""];
    const colors = product.colors?.length ? product.colors : [""];
    const combos = sizes.flatMap((s) => colors.map((c) => keyOf(s, c)));
    let left = Number(product.stock) || 0;
    const counts = Object.fromEntries(combos.map((k) => [k, 0]));

    for (let i = 0; left > 0 && combos.length; i = (i + 1) % combos.length) {
        counts[combos[i]] += 1;
        left -= 1;
    }
    combos.forEach((k) => (map[k] = String(counts[k])));
    return map;
}

/**
 * Stock table: one number per size + colour.
 * `sizes` / `colors` are the comma-separated strings from the chip inputs.
 */
function StockGrid({ sizes, colors, value, onChange }) {
    const sizeList = splitList(sizes);
    const colorList = splitList(colors);

    if (!sizeList.length && !colorList.length) {
        return (
            <p className="sg-grid-hint">
                Add at least one size and one colour to set stock for each combination.
            </p>
        );
    }

    const rows = sizeList.length ? sizeList : [""];
    const cols = colorList.length ? colorList : [""];

    const total = rows.reduce(
        (sum, size) =>
            sum +
            cols.reduce(
                (inner, color) =>
                    inner + (parseInt(value[keyOf(size, color)], 10) || 0),
                0
            ),
        0
    );

    return (
        <div className="stock-grid">
            <div className="stock-grid-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Size</th>
                            {cols.map((color) => (
                                <th key={color || "all"}>{color || "Stock"}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((size) => (
                            <tr key={size || "all"}>
                                <th scope="row">{size || "—"}</th>
                                {cols.map((color) => (
                                    <td key={color || "all"}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            inputMode="numeric"
                                            aria-label={`Stock ${size} ${color}`.trim()}
                                            value={value[keyOf(size, color)] ?? ""}
                                            placeholder="0"
                                            onChange={(e) =>
                                                onChange({
                                                    ...value,
                                                    [keyOf(size, color)]: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="stock-grid-total">Total in stock: <b>{total}</b></p>
        </div>
    );
}

export default StockGrid;
