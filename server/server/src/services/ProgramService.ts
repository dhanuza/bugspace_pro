import type { IProgramRepository, ProgramListOptions } from "../interfaces/IProgramRepository.js";

export class ProgramService {
  constructor(private repo: IProgramRepository) {}
  list(orgId: string, options?: ProgramListOptions) { return this.repo.list(orgId, options); }
  listAll(options?: ProgramListOptions) { return this.repo.listAll(options); }
  get(orgId: string, id: string) { return this.repo.get(orgId, id); }
  create(orgId: string, input: any) { return this.repo.create(orgId, input); }
}
