const Sale = require('../models/Sale.model');
const Production = require('../models/Production.model');
const AppError = require('../utils/AppError');

const getSalesByProduction = async (productionId, farmerId) => {
  return Sale.find({ productionId, farmerId, deletedAt: null }).sort({ saleDate: -1 });
};

const getSalesByCrop = async (cropId, farmerId) => {
  return Sale.find({ cropId, farmerId, deletedAt: null }).sort({ saleDate: -1 });
};

const createSale = async (farmerId, data) => {
  // Verify production record exists
  const production = await Production.findOne({
    productionId: data.productionId,
    farmerId,
    deletedAt: null,
  });
  if (!production) throw new AppError('Production record not found', 404);

  // Check enough unsold balance remains
  if (data.quantity > production.unsoldBalance) {
    throw new AppError(
      `Cannot sell ${data.quantity} ${production.unit}. Only ${production.unsoldBalance} ${production.unit} unsold.`,
      400
    );
  }

  const totalAmount = parseFloat((data.quantity * data.ratePerUnit).toFixed(2));

  const sale = await Sale.create({ ...data, farmerId, totalAmount });

  // Reduce unsold balance on production
  await Production.findOneAndUpdate(
    { productionId: data.productionId },
    {
      $inc: { unsoldBalance: -data.quantity },
      updatedAt: Date.now(),
    }
  );

  return sale;
};

const updateSale = async (saleId, farmerId, data) => {
  const sale = await Sale.findOne({ saleId, farmerId, deletedAt: null });
  if (!sale) throw new AppError('Sale record not found', 404);

  // Recalculate totalAmount if quantity or rate changes
  if (data.quantity !== undefined || data.ratePerUnit !== undefined) {
    const quantity = data.quantity ?? sale.quantity;
    const rate = data.ratePerUnit ?? sale.ratePerUnit;
    data.totalAmount = parseFloat((quantity * rate).toFixed(2));

    // Adjust unsold balance on production
    const quantityDiff = (data.quantity ?? sale.quantity) - sale.quantity;
    if (quantityDiff !== 0) {
      await Production.findOneAndUpdate(
        { productionId: sale.productionId },
        { $inc: { unsoldBalance: -quantityDiff }, updatedAt: Date.now() }
      );
    }
  }

  return Sale.findOneAndUpdate(
    { saleId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
};

const softDeleteSale = async (saleId, farmerId) => {
  const sale = await Sale.findOne({ saleId, farmerId, deletedAt: null });
  if (!sale) throw new AppError('Sale record not found', 404);

  await Sale.findOneAndUpdate({ saleId }, { deletedAt: Date.now(), deletedBy: farmerId });

  // Restore unsold balance
  await Production.findOneAndUpdate(
    { productionId: sale.productionId },
    { $inc: { unsoldBalance: sale.quantity }, updatedAt: Date.now() }
  );

  return { deleted: true };
};

const restoreSale = async (saleId, farmerId) => {
  const sale = await Sale.findOne({ saleId, farmerId, deletedAt: { $ne: null } });
  if (!sale) throw new AppError('Sale record not found in trash', 404);

  await Sale.findOneAndUpdate({ saleId }, { deletedAt: null, deletedBy: null });

  // Re-deduct unsold balance
  await Production.findOneAndUpdate(
    { productionId: sale.productionId },
    { $inc: { unsoldBalance: -sale.quantity }, updatedAt: Date.now() }
  );

  return { restored: true };
};

module.exports = {
  getSalesByProduction,
  getSalesByCrop,
  createSale,
  updateSale,
  softDeleteSale,
  restoreSale,
};
