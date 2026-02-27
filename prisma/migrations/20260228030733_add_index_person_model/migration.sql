-- CreateIndex
CREATE INDEX "persons_generation_idx" ON "persons"("generation");

-- CreateIndex
CREATE INDEX "persons_is_deceased_idx" ON "persons"("is_deceased");

-- CreateIndex
CREATE INDEX "persons_birth_year_idx" ON "persons"("birth_year");

-- CreateIndex
CREATE INDEX "persons_is_in_law_idx" ON "persons"("is_in_law");
