import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/services/auth.service";

const prisma = new PrismaClient();

// Dummy staff accounts for local dev/testing, named after the actual
// people building this project - just for reference, not real accounts.
// upsert (not create) so running this multiple times doesn't error or
// duplicate rows, per database-prisma SKILL.md.
async function main() {
  const staff = [
    { name: "Utsav Padaliya", loginId: "utsav01", email: "utsav@example.com", password: "Utsav@123", role: "ADMIN" as const },
    { name: "Maulik", loginId: "maulik01", email: "maulik@example.com", password: "Maulik@123", role: "ACCOUNTANT" as const },
    { name: "Dipesh", loginId: "dipesh01", email: "dipesh@example.com", password: "Dipesh@123", role: "ACCOUNTANT" as const },
  ];

  for (const person of staff) {
    const passwordHash = await hashPassword(person.password);
    await prisma.user.upsert({
      where: { loginId: person.loginId },
      update: {},
      create: {
        name: person.name,
        loginId: person.loginId,
        email: person.email,
        passwordHash,
        role: person.role,
      },
    });
    console.log(`Seeded user: ${person.loginId} (password: ${person.password})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
