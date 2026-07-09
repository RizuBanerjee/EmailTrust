from pydantic import BaseModel


class DomainCreate(BaseModel):
    domain: str


class DomainImportRequest(BaseModel):
    domains: list[str]