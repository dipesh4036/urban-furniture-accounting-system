-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NOT NULL,
    `vendorId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'BILLED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_poNumber_key`(`poNumber`),
    INDEX `purchase_orders_vendorId_idx`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,

    INDEX `purchase_order_items_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `purchase_order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_bills` (
    `id` VARCHAR(191) NOT NULL,
    `billNumber` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `vendorId` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendor_bills_billNumber_key`(`billNumber`),
    UNIQUE INDEX `vendor_bills_purchaseOrderId_key`(`purchaseOrderId`),
    INDEX `vendor_bills_vendorId_idx`(`vendorId`),
    INDEX `vendor_bills_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_orders` (
    `id` VARCHAR(191) NOT NULL,
    `soNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'BILLED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sales_orders_soNumber_key`(`soNumber`),
    INDEX `sales_orders_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `salesOrderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    INDEX `sales_order_items_salesOrderId_idx`(`salesOrderId`),
    INDEX `sales_order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `salesOrderId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `emailSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customer_invoices_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `customer_invoices_salesOrderId_key`(`salesOrderId`),
    INDEX `customer_invoices_customerId_idx`(`customerId`),
    INDEX `customer_invoices_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PAYMENT', 'REFUND') NOT NULL,
    `method` ENUM('BANK_TRANSFER', 'CHEQUE', 'CASH', 'CARD', 'ONLINE') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `vendorBillId` VARCHAR(191) NULL,
    `customerInvoiceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_vendorBillId_idx`(`vendorBillId`),
    INDEX `payments_customerInvoiceId_idx`(`customerInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `contacts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_bills` ADD CONSTRAINT `vendor_bills_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_bills` ADD CONSTRAINT `vendor_bills_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `contacts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_orders` ADD CONSTRAINT `sales_orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `contacts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_order_items` ADD CONSTRAINT `sales_order_items_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `sales_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_order_items` ADD CONSTRAINT `sales_order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_invoices` ADD CONSTRAINT `customer_invoices_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `sales_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_invoices` ADD CONSTRAINT `customer_invoices_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `contacts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_vendorBillId_fkey` FOREIGN KEY (`vendorBillId`) REFERENCES `vendor_bills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_customerInvoiceId_fkey` FOREIGN KEY (`customerInvoiceId`) REFERENCES `customer_invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
