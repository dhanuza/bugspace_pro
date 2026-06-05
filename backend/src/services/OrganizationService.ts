import type { IOrganizationRepository } from "../interfaces/IOrganizationRepository.js";

export class OrganizationService {
  constructor(private repo: IOrganizationRepository) {}

  list() {
    return this.repo.list();
  }

  get(id: string) {
    return this.repo.get(id);
  }

  create(input: { name: string; domain?: string }, createdBy: string) {
    return this.repo.create({ name: input.name, domain: input.domain, createdBy });
  }
}
