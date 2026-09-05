-- CreateTable
CREATE TABLE `analytic_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `plannedAmount` DECIMAL(10, 2) NOT NULL,
    `analyticAccountId` VARCHAR(191) NOT NULL,
    `responsiblePersonId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `budgets_analyticAccountId_idx`(`analyticAccountId`),
    INDEX `budgets_responsiblePersonId_idx`(`responsiblePersonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_analyticAccountId_fkey` FOREIGN KEY (`analyticAccountId`) REFERENCES `analytic_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_responsiblePersonId_fkey` FOREIGN KEY (`responsiblePersonId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
