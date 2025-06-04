"use server";

import connectDb from "@/db/connectDb"
import Product from "@/models/Products"
import ProductHistory from "@/models/ProductHistory";
import Invoice from "@/models/Invoice";

export const fetchProducts = async (userId, status) => {
  await connectDb();

  const products = await Product.find({ user: userId, recordStatus: status }).sort({ date: -1 });

  if (!products || products.length === 0) {
    return {};
  }
  const safeProducts = products.map(product => product.toObject({ flattenObjectIds: true })
  );

  return safeProducts;
};


export const createProduct = async (data) => {
  await connectDb();

  let ndata = { ...data };


  let existingProduct = await Product.findOne({
    productName: ndata.productName,
    user: ndata.user,
  });

  if (existingProduct) {
    return { error: "Product Name already exists for this user" };
  }


  let newProduct = await Product.create(ndata);

  if (!newProduct) {
    return { error: "Failed to create product" };
  }
  let newProductHistory = await ProductHistory.create({
    product: newProduct._id,
    user: ndata.user,
    productId: newProduct.productId,
    productQuantity: ndata.productQuantity,
  });

  // 2. Aggregate balances only from active records
  const aggregates = await ProductHistory.aggregate([
    {
      $match: {
        product: newProductHistory.product,
        recordStatus: "active",
      },
    },
    {
      $group: {
        _id: "$product",
        totalproduct: { $sum: "$productQuantity" },
      },
    },
  ]);

  const { totalproduct = 0 } = aggregates[0] || {};
  const finalproduct = totalproduct;

  // 3. Update the operator's balance
  await Product.findByIdAndUpdate(
    newProductHistory.product,
    { productQuantity: totalproduct, productQuantityremaining: finalproduct },
    { new: true }
  );
  await recalculateProductQuantities();

  return { status: 200, message: "Product created successfully" };
};



//update product
export const updateProduct = async (data) => {
  await connectDb();

  let ndata = { ...data };


  const existingProduct = await Product.findOne({
    productName: ndata.productName,
    user: ndata.user,
    _id: { $ne: ndata._id },
  });

  if (existingProduct) {
    return { error: "Product Name already exists." };
  }


  const updatedProduct = await Product.findByIdAndUpdate(ndata._id, ndata, {
    new: true,
  });
  await recalculateProductQuantities();
  if (!updatedProduct) {
    return { error: "Failed to update product" };

  }


  return { status: 200, message: "Product updated successfully" };
};


//delete product
export const productDelete = async (id) => {
  await connectDb();

  try {
    const productDel = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          recordStatus: "deactivated",
          deactivatedAt: new Date()
        }
      },
      { new: true }
    );

    const productHistoryResult = await ProductHistory.updateMany(
      { product: id },
      {
        $set: {
          recordStatus: "deactivated",
          deactivatedAt: new Date()
        }
      }
    );
    await recalculateProductQuantities();


    if (productDel && productHistoryResult) {
      return {
        status: 200,
        message: "Successfully soft-deleted record",

      };
    } else {
      return {
        status: 404,
        message: "Record not found",
      };
    }
  } catch (error) {
    console.error('Failed to soft-delete product history:', error);
    throw new Error('Server error while deactivating product history');
  }
};



export const RestoreProduct = async (id) => {
  await connectDb();
  try {
    const prod = await Product.findById(id);
    if (!prod) {
      return { error: "product not found" };
    }

    await Product.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          recordStatus: "active",
          deactivatedAt: null
        }
      },
      { new: true }
    );
    await recalculateProductQuantities();
    return { success: true, message: "Product Restore successfully" };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { error: "Failed to delete invoice" };
  }
}



export const recalculateProductQuantities = async () => {
  try {
    // Only get active products
    const allProducts = await Product.find({ recordStatus: "active" });

    for (const product of allProducts) {
      // Find total quantity sold for this product in active invoices
      const sold = await Invoice.aggregate([
        { $match: { recordStatus: "active" } }, // Filter active invoices
        { $unwind: "$items" },
        { $match: { "items.productId": product._id } },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.item_quantity" },
          },
        },
      ]);

      const totalSold = sold.length > 0 ? sold[0].totalSold : 0;
      const remainingQty = product.productQuantity - totalSold;

      await Product.updateOne(
        { _id: product._id },
        { $set: { productQuantityremaining: remainingQty } }
      );
    }
  } catch (error) {
    console.error("Error recalculating product quantities:", error);
  }
};


