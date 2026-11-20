import { useState } from "react";

/**
 * Chip input for sizes / colours. Works with the comma-separated string the
 * API already expects: `value` = "S, M, L", `onChange(string)`.
 */
function TagInput({ id, value, onChange, placeholder, suggestions = [] }) {
    const [draft, setDraft] = useState("");
    const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

    function commit(list) {
        onChange(list.join(", "));
    }

    function add(raw) {
        const incoming = String(raw)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        if (!incoming.length) return;
        const next = [...tags];
        incoming.forEach((tag) => {
            if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
                next.push(tag);
            }
        });
        commit(next);
        setDraft("");
    }

    return (
        <div className="tags">
            <div className="tags-box">
                {tags.map((tag) => (
                    <span className="tags-chip" key={tag}>
                        {tag}
                        <button
                            type="button"
                            onClick={() => commit(tags.filter((t) => t !== tag))}
                            aria-label={`Remove ${tag}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    value={draft}
                    placeholder={tags.length ? "Add another…" : placeholder}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v.includes(",")) add(v);
                        else setDraft(v);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add(draft);
                        } else if (e.key === "Backspace" && !draft && tags.length) {
                            commit(tags.slice(0, -1));
                        }
                    }}
                    onBlur={() => add(draft)}
                />
            </div>

            {suggestions.length > 0 && (
                <div className="tags-suggest">
                    <span>Quick add:</span>
                    {suggestions
                        .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
                        .map((s) => (
                            <button type="button" key={s} onClick={() => add(s)}>
                                + {s}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}

export default TagInput;
