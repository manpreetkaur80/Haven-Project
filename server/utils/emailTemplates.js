const clientUrl = () =>
    (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();

const esc = (value) =>
    String(value ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function layout(title, bodyHtml, button) {
    return `<!doctype html><html><body style="margin:0;background:#f7f3ec;font-family:Helvetica,Arial,sans-serif;color:#2a2723">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #ddd4c4">
<tr><td style="background:#1c1511;padding:26px;text-align:center;color:#f1e8da;font-size:22px;letter-spacing:10px;font-family:Georgia,serif">HAVEN</td></tr>
<tr><td style="padding:34px 34px 28px">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:28px;color:#1c1511">${esc(title)}</h1>
${bodyHtml}
${button ? `<p style="margin:28px 0 0"><a href="${esc(button.url)}" style="display:inline-block;background:#1c1511;color:#f1e8da;padding:14px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase">${esc(button.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:18px 34px;border-top:1px solid #ebe4d8;color:#8a7d6c;font-size:12px">HAVEN · Everyday, in your element.</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (text) => `<p style="margin:0 0 14px;line-height:1.65;font-size:15px;color:#4a443c">${text}</p>`;

function itemsTable(order) {
    const rows = (order.items || [])
        .map(
            (i) =>
                `<tr><td style="padding:10px 0;border-bottom:1px solid #ebe4d8;font-size:14px">${esc(i.name)}<br><span style="color:#8a7d6c;font-size:12px">Qty ${i.quantity}${i.size ? ` · ${esc(i.size)}` : ""}${i.color ? ` · ${esc(i.color)}` : ""}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #ebe4d8;font-size:14px">${money(i.price * i.quantity)}</td></tr>`
        )
        .join("");
    return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0">${rows}<tr><td style="padding-top:14px;font-weight:bold">Total · ${esc(order.paymentMethod)}</td><td align="right" style="padding-top:14px;font-weight:bold">${money(order.totalAmount)}</td></tr></table>`;
}

const shortId = (order) => String(order._id).slice(-8).toUpperCase();

function welcomeEmail(user) {
    return {
        subject: "Welcome to HAVEN",
        text: `Hi ${user.name}, welcome to HAVEN. Start shopping: ${clientUrl()}/products`,
        html: layout(
            `Welcome, ${user.name}`,
            p("Your HAVEN account is ready. Save your favourites, check out faster and follow every order."),
            { label: "Start shopping", url: `${clientUrl()}/products` }
        ),
    };
}

function resetPasswordEmail(user, resetUrl) {
    return {
        subject: "Reset your HAVEN password",
        text: `Hi ${user.name}, reset your password here (valid for 30 minutes): ${resetUrl}\nIf you didn't ask for this, ignore this email.`,
        html: layout(
            "Reset your password",
            p(`Hi ${esc(user.name)}, we received a request to reset your password. This link works for 30 minutes.`) +
                p("If you didn’t ask for this, you can safely ignore this email."),
            { label: "Choose a new password", url: resetUrl }
        ),
    };
}

function orderPlacedEmail(order) {
    const paid = order.paymentStatus === "Paid";
    return {
        subject: `HAVEN order #${shortId(order)} confirmed`,
        text: `Thank you! Order #${shortId(order)} total ${money(order.totalAmount)} (${order.paymentMethod}).`,
        html: layout(
            "Thank you for your order",
            p(`Order <b>#${shortId(order)}</b> is placed. ${paid ? "Your payment was received." : "Please keep the amount ready for delivery."}`) +
                itemsTable(order),
            { label: "Track your order", url: `${clientUrl()}/orders/${order._id}` }
        ),
    };
}

const STATUS_COPY = {
    Confirmed: "We’ve confirmed your order and will start preparing it soon.",
    Processing: "Your order is being prepared.",
    Shipped: "Good news — your order is on its way.",
    Delivered: "Your order has been delivered. We hope you love it.",
    Cancelled: "Your order has been cancelled. If you paid online, the refund will be processed.",
    Returned: "We’ve received your return.",
    Refunded: "Your refund has been processed.",
};

function orderStatusEmail(order) {
    const copy = STATUS_COPY[order.orderStatus];
    if (!copy) return null;
    return {
        subject: `Order #${shortId(order)} — ${order.orderStatus}`,
        text: `${copy} Track: ${clientUrl()}/orders/${order._id}`,
        html: layout(`Order ${order.orderStatus.toLowerCase()}`, p(copy) + itemsTable(order), {
            label: "Track your order",
            url: `${clientUrl()}/orders/${order._id}`,
        }),
    };
}

module.exports = {
    welcomeEmail,
    resetPasswordEmail,
    orderPlacedEmail,
    orderStatusEmail,
    clientUrl,
};
