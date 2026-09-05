-- AlterTable
ALTER TABLE `payments` MODIFY `type` ENUM('RECEIPT', 'PAYMENT', 'REFUND') NOT NULL;
