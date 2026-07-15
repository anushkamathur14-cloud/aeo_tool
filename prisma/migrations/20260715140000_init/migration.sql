-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "JourneyStage" AS ENUM ('AWARENESS', 'DISCOVERY', 'RESEARCH', 'COMPARISON', 'PURCHASE', 'SUPPORT');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "products" TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED',
    "visibilityScore" DOUBLE PRECISION,
    "config" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "stage" "JourneyStage" NOT NULL,
    "scanId" TEXT NOT NULL,
    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromptResponse" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "sources" JSONB NOT NULL,
    "mentions" JSONB NOT NULL,
    "sentiment" DOUBLE PRECISION NOT NULL,
    "recommendationStrength" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "answerLength" INTEGER NOT NULL,
    "promptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptResponse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VisibilitySnapshot" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "components" JSONB NOT NULL,
    "engine" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brandId" TEXT NOT NULL,
    CONSTRAINT "VisibilitySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "effort" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "expectedLift" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EntityNode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "brandId" TEXT NOT NULL,
    CONSTRAINT "EntityNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EntityEdge" (
    "id" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    CONSTRAINT "EntityEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderCredential" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProviderCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");
CREATE INDEX "Brand_organizationId_idx" ON "Brand"("organizationId");
CREATE INDEX "Competitor_brandId_idx" ON "Competitor"("brandId");
CREATE INDEX "Scan_brandId_createdAt_idx" ON "Scan"("brandId", "createdAt");
CREATE INDEX "Prompt_scanId_stage_idx" ON "Prompt"("scanId", "stage");
CREATE INDEX "PromptResponse_promptId_provider_idx" ON "PromptResponse"("promptId", "provider");
CREATE INDEX "VisibilitySnapshot_brandId_capturedAt_idx" ON "VisibilitySnapshot"("brandId", "capturedAt");
CREATE INDEX "Opportunity_brandId_status_idx" ON "Opportunity"("brandId", "status");
CREATE INDEX "EntityNode_brandId_idx" ON "EntityNode"("brandId");
CREATE UNIQUE INDEX "EntityEdge_sourceId_targetId_relation_key" ON "EntityEdge"("sourceId", "targetId", "relation");
CREATE UNIQUE INDEX "ProviderCredential_organizationId_provider_key" ON "ProviderCredential"("organizationId", "provider");
CREATE INDEX "Report_brandId_createdAt_idx" ON "Report"("brandId", "createdAt");

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromptResponse" ADD CONSTRAINT "PromptResponse_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisibilitySnapshot" ADD CONSTRAINT "VisibilitySnapshot_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntityNode" ADD CONSTRAINT "EntityNode_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntityEdge" ADD CONSTRAINT "EntityEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EntityNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntityEdge" ADD CONSTRAINT "EntityEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EntityNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderCredential" ADD CONSTRAINT "ProviderCredential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
