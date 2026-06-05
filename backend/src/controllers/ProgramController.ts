import type { Request, Response } from "express";
import { ProgramService } from "../services/ProgramService.js";
import { programRepo } from "../repositories/index.js";

const service = new ProgramService(programRepo);

export const ProgramController = {
  list: async (req: Request, res: Response) => {
    // Admin sees all programs; others see only their org
    const programs = req.user!.role === "admin" 
      ? await service.listAll() 
      : await service.list(req.orgId!);
    return res.json(programs);
  },

  get: async (req: Request, res: Response) => {
    const p = await service.get(req.orgId!, req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  },

  create: async (req: Request, res: Response) =>
    res.status(201).json(await service.create(req.orgId!, req.body)),
};
