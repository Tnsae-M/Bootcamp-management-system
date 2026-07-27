import jwt from "jsonwebtoken";

// Role hierarchy (ADR-0002). Holding a role grants every role it implies,
// so routes list only the minimum role they require. The single edge:
// SUPER ADMIN can do everything ADMIN can. ADMIN does NOT imply INSTRUCTOR.
const ROLE_IMPLIES = {
  "SUPER ADMIN": ["ADMIN"],
};

const expandRoles = (roles) => {
  const expanded = new Set(roles);
  for (const role of roles) {
    for (const implied of ROLE_IMPLIES[role] || []) {
      expanded.add(implied);
    }
  }
  return expanded;
};

export const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
          const error = new Error(
            "Server configuration error: JWT secret missing",
          );
          error.status = 500;
          return next(error);
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, roles: payload.roles || [] };
      }

      if (!req.user || !req.user.roles || req.user.roles.length === 0) {
        const error = new Error("Access denied: Authentication required");
        error.status = 401;
        return next(error);
      }

      const rolesArray = Array.isArray(allowedRoles)
        ? allowedRoles.map(r => String(r).toUpperCase())
        : [String(allowedRoles).toUpperCase()];

      const rawRoles = req.user.roles || [];
      const userRoles = rawRoles
        .filter(r => r) // Remove undefined/null
        .map(r => String(r).toUpperCase());

      const effectiveRoles = expandRoles(userRoles);
      const hasPermission = rolesArray.some(role => effectiveRoles.has(role));

      if (!hasPermission) {
        const error = new Error(
          `Access denied: Insufficient role permissions. User has roles: [${userRoles.join(", ")}], but requires one of: [${rolesArray.join(", ")}]`,
        );
        error.status = 403;
        return next(error);
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const error = new Error("Token expired");
        error.status = 401;
        return next(error);
      } else if (err.name === "JsonWebTokenError") {
        const error = new Error("Invalid token");
        error.status = 401;
        return next(error);
      }
      next(err);
    }
  };
};

export const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (!process.env.JWT_SECRET) {
        const error = new Error(
          "Server configuration error: JWT secret missing",
        );
        error.status = 500;
        return next(error);
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: payload.userId, roles: payload.roles || [] };
    }

    if (!req.user) {
      const error = new Error("Authentication required");
      error.status = 401;
      return next(error);
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("Token expired");
      error.status = 401;
      return next(error);
    } else if (err.name === "JsonWebTokenError") {
      const error = new Error("Invalid token");
      error.status = 401;
      return next(error);
    }
    next(err);
  }
};
