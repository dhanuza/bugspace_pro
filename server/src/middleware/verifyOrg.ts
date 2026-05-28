import type { Request, Response, NextFunction } from "express";

export function verifyOrg(req: Request, res: Response, next: NextFunction) {
  const headerOrg = req.headers["x-org-id"] as string | undefined;
  
  console.log('[verifyOrg] Checking org:', {
    headerOrg,
    userOrgId: req.user?.orgId,
    userId: req.user?.id,
    userRole: req.user?.role
  });
  
  if (!headerOrg) {
    console.log('[verifyOrg] Missing x-org-id header');
    return res.status(400).json({ error: "Missing orgId" });
  }
  
  if (req.user && req.user.orgId !== headerOrg) {
    console.log('[verifyOrg] Org mismatch:', req.user.orgId, '!==', headerOrg);
    return res.status(403).json({ error: "Org mismatch" });
  }
  
  req.orgId = headerOrg;
  next();
}
