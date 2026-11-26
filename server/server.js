// require("dotenv").config();

// const app = require("./app");
// const connectDB = require("./config/db");
// const { startPaymentSweeper } = require("./utils/paymentSweeper");

// // A weak JWT secret lets anyone forge logins. Fatal in production, a warning locally.
// if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
//     const message =
//         "JWT_SECRET should be a random string of at least 32 characters.";

//     if (process.env.NODE_ENV === "production" || !process.env.JWT_SECRET) {
//         console.error(message);
//         process.exit(1);
//     }
//     console.warn(`WARNING: ${message}`);
// }

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     await connectDB();
//     startPaymentSweeper();

//     app.listen(PORT, () => {
//         console.log(`HAVEN server running on port ${PORT}`);
//     });
// };

// startServer();
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startPaymentSweeper } = require("./utils/paymentSweeper");
const { describeEmailMode } = require("./utils/email");

// A weak JWT secret lets anyone forge logins. Fatal in production, a warning locally.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const message =
        "JWT_SECRET should be a random string of at least 32 characters.";

    if (process.env.NODE_ENV === "production" || !process.env.JWT_SECRET) {
        console.error(message);
        process.exit(1);
    }
    console.warn(`WARNING: ${message}`);
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    startPaymentSweeper();
    console.log(describeEmailMode());

    app.listen(PORT, () => {
        console.log(`HAVEN server running on port ${PORT}`);
    });
};

startServer();