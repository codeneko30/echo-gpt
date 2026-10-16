
export default function roleMiddleware(allowedRoles) {

    return function (req, res, next) {

        try {

            if (!req.user || !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: "Access denied: Insufficient permissions"
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                error: "Internal server error"
            });

        }

    };

}