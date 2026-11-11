/**
 * Middleware for validating context-scoped roles.
 *
 * Grounded in:
 * - ADR-0005 (Roles are scoped to Division or Bootcamp, not global)
 * - ADR-0002 (SUPER ADMIN implies ADMIN; no other roles imply each other)
 */

export const scopeGuard = ({ requiredRole, scopeType, resolveScopeId }) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleAssignments) {
        const error = new Error("Authentication required: missing role assignments");
        error.status = 401;
        return next(error);
      }

      const assignments = req.user.roleAssignments;

      // 1. SUPER_ADMIN bypasses all scope checks
      const isSuperAdmin = assignments.some(
        (a) => a.role === "SUPER_ADMIN" && a.scopeType === "GLOBAL"
      );

      if (isSuperAdmin) {
        return next();
      }

      // 2. Resolve target resource scope
      const targetScopeId = resolveScopeId ? await resolveScopeId(req) : null;

      // 3. Match user's assignments against required role and resolved scope
      const hasPermission = assignments.some((a) => {
        if (a.role !== requiredRole) return false;

        // If checking a scoped resource (e.g. DIVISION or BOOTCAMP), scopeId must match
        if (scopeType && a.scopeType === scopeType) {
          return targetScopeId ? a.scopeId === targetScopeId : true;
        }

        return false;
      });

      if (hasPermission) {
        return next();
      }

      const error = new Error("Access denied: Insufficient scope or permissions");
      error.status = 403;
      return next(error);
    } catch (err) {
      return next(err);
    }
  };
};
