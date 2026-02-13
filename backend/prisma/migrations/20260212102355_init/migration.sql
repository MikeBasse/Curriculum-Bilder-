-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT,
    "gradeLevel" TEXT,
    "tags" JSONB DEFAULT '[]',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "sourceDocumentIds" JSONB DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Generation_projectId_idx" ON "Generation"("projectId");

-- CreateIndex
CREATE INDEX "Generation_userId_idx" ON "Generation"("userId");

-- CreateIndex
CREATE INDEX "UsageTracking_userId_idx" ON "UsageTracking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_action_month_key" ON "UsageTracking"("userId", "action", "month");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
