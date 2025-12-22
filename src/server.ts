import envConfig from "@config/env";
import app from "./app";

const PORT = process.env.PORT || envConfig.PORT;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
