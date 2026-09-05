-- AlterTable
ALTER TABLE `payments` MODIFY `type` ENUM('RECEIPT', 'PAYMENT') NOT NULL;
