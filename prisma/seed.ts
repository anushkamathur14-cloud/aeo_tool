import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to seed BrandSignal");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const scoreHistory = [52.4, 54.1, 55.8, 58.2, 60.6, 62.1, 65.7, 68.4, 70.2, 72.8, 75.1, 78.4];

async function main() {
  await prisma.organization.deleteMany({ where: { slug: "brandsignal-demo" } });
  const organization = await prisma.organization.create({
    data: {
      name: "BrandSignal Demo",
      slug: "brandsignal-demo",
      memberships: {
        create: {
          role: "OWNER",
          user: { create: { name: "Demo Owner", email: "demo@brandsignal.ai" } },
        },
      },
      brands: {
        create: {
          name: "NovaCRM",
          website: "https://novacrm.example",
          industry: "CRM software",
          country: "United States",
          audience: "fast-growing B2B startups and revenue teams",
          products: ["NovaCRM Growth", "NovaCRM Intelligence"],
          competitors: {
            create: [
              { name: "HubSpot", website: "https://hubspot.com" },
              { name: "Salesforce", website: "https://salesforce.com" },
              { name: "Attio", website: "https://attio.com" },
            ],
          },
          opportunities: {
            create: [
              {
                category: "Authority",
                title: "Earn citations in independent CRM comparisons",
                rationale: "Perplexity cites third-party category reports in 64% of purchase answers.",
                effort: 4,
                impact: 5,
                expectedLift: 8.4,
                confidence: 0.91,
              },
              {
                category: "Comparisons",
                title: "Publish NovaCRM vs HubSpot for startup teams",
                rationale: "Direct comparison prompts account for the largest share-of-answer gap.",
                effort: 3,
                impact: 5,
                expectedLift: 7.2,
                confidence: 0.89,
              },
              {
                category: "Schema",
                title: "Connect product and audience entities",
                rationale: "Product schema does not identify target audience or core feature relationships.",
                effort: 2,
                impact: 3,
                expectedLift: 4.8,
                confidence: 0.84,
              },
            ],
          },
        },
      },
    },
    include: { brands: true },
  });

  const brand = organization.brands[0];
  for (const [index, score] of scoreHistory.entries()) {
    const capturedAt = new Date();
    capturedAt.setDate(capturedAt.getDate() - (scoreHistory.length - index - 1) * 7);
    await prisma.visibilitySnapshot.create({
      data: {
        brandId: brand.id,
        score,
        capturedAt,
        components: {
          mentionRate: score + 4,
          shareOfAnswers: score - 2,
          averageRank: score - 7,
          citationFrequency: score - 18,
          positiveRecommendation: score + 5,
          sentiment: score + 8,
          competitorShare: score - 4,
          authority: score - 16,
          contentCoverage: score - 8,
          entityRecognition: score + 2,
        },
      },
    });
  }

  console.log(`Seeded ${organization.name} with ${scoreHistory.length} visibility snapshots.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
