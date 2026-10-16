export function getSystemHealth() {
    return {
        system: "Healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    };
}