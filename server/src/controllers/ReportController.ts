import type { Request, Response } from "express";
import { ReportService } from "../services/ReportService.js";
import { reportRepo } from "../repositories/index.js";

const service = new ReportService(reportRepo);

export const ReportController = {
  list: async (req: Request, res: Response) => {
    console.log("USER:", req.user);
    console.log("ORG:", req.orgId);
    const data = await reportRepo.list("org-1");
    console.log("BACKEND REPORTS:", data);
    return res.json(data);
  },

get: async (req: Request, res: Response) => {
    const r = await service.get(req.orgId!, req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(r);
  },

  create: async (req: Request, res: Response) => {
    const reporter = { id: req.user!.id, name: req.user!.id };
    res.status(201).json(await service.create(req.orgId!, req.body, reporter));
  },

  updateStatus: async (req: Request, res: Response) => {
    const r = await service.updateStatus(req.orgId!, req.params.id, req.body.status);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(r);
  },

  listComments: async (req: Request, res: Response) =>
    res.json(await service.comments(req.orgId!, req.params.id)),

  addComment: async (req: Request, res: Response) => {
    const author = { id: req.user!.id, name: req.user!.id };
    res
      .status(201)
      .json(await service.addComment(req.orgId!, req.params.id, req.body.body, author));
  },
};
