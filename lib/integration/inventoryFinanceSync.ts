import FinancialTransaction from '../../models/FinancialTransaction';
import Product from '../../models/Product';
import { dbConnect } from '../mongoose';
import { ChangeStreamDocument } from 'mongodb';

// خدمة مزامنة تحديثات المخزون مع المعاملات المالية
export class InventoryFinanceSync {
  private static instance: InventoryFinanceSync;

  private constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    await dbConnect();
    await this.setupEventListeners();
  }

  public static getInstance(): InventoryFinanceSync {
    if (!InventoryFinanceSync.instance) {
      InventoryFinanceSync.instance = new InventoryFinanceSync();
    }
    return InventoryFinanceSync.instance;
  }

  private async setupEventListeners() {
    await dbConnect();
    
    // مراقبة تغييرات المخزون
    Product.watch().on('change', async (change: ChangeStreamDocument) => {
      if (change.operationType === 'update' && change.updateDescription?.updatedFields) {
        const productId = change.documentKey._id.toString();
        const updatedFields = change.updateDescription.updatedFields;
        
        if ('quantity' in updatedFields) {
          await this.handleInventoryUpdate(productId, updatedFields.quantity as number);
        }
      }
    });
  }

  private async handleInventoryUpdate(productId: string, newQuantity: number) {
    const product = await Product.findById(productId);
    
    if (!product) return;

    // حساب الفرق في الكمية وتحديث القيمة المالية
    const quantityDiff = newQuantity - product.quantity;
    const financialImpact = quantityDiff * product.unitPrice;

    if (financialImpact !== 0) {
      await FinancialTransaction.create({
        amount: Math.abs(financialImpact),
        type: financialImpact > 0 ? 'INVENTORY_INCREASE' : 'INVENTORY_DECREASE',
        description: `تحديث تلقائي للمخزون - ${product.name}`,
        date: new Date(),
        product: productId,
        automatic: true // علامة للمعاملات التلقائية
      });
    }

    // تحديث كمية المنتج في قاعدة البيانات
    product.quantity = newQuantity;
    await product.save();
  }
}

// بدء خدمة المزامنة عند تشغيل النظام
InventoryFinanceSync.getInstance();