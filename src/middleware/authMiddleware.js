import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next) {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
        token = token.substring(7);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token!" });
        }
        req.user = {
            userid: decoded.userid,
            email: decoded.email,
            role: decoded.role
        };
        next();
    });
}

export default authMiddleware
