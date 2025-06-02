"use server";

import connectDb from "@/db/connectDb"
import Product from "@/models/Products"
import ProductHistory from "@/models/ProductHistory";
import Invoice from "@/models/Invoice";


export const fetchProductsHistory = async (product, status) => {
  await connectDb();
  // console.log("server", product, status)
  const products = await ProductHistory.find({ product: product, recordStatus: status }).sort({ date: -1 });

  if (!products || products.length === 0) {
    return {};
  }

  const safeProducts = products.map(product => product.toObject({ flattenObjectIds: true })
  );

  return safeProducts;
}

export const AddProductHistory = async (data) => {
  await connectDb();

  let ndata = { ...data };

  // Step 1: Create a new product history record
  const newProductHistory = await ProductHistory.create({
    product: ndata._id,
    user: ndata.user,
    productId: ndata.productId,
    productQuantity: ndata.productQuantity,
  });

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
    { productQuantity: totalproduct , productQuantityremaining: finalproduct},
    { new: true }
  );
  await recalculateProductQuantities();
  return { status: 200, message: "Product history added and product updated successfully" };
};






// Function to update product history
export const updateProductHistory = async (data) => {
  await connectDb();

  try {
    const newProductHistory = await ProductHistory.findByIdAndUpdate(
      data._id,
      {
        $set: {
          productQuantity: data.productQuantity,
          date: data.date,
        }
      },
      { new: true } // Return the updated document
    );
    if (!newProductHistory) {
      return {
        status: 404,
        message: 'Product history not found',
      };
    }


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
    return {
      status: 200,
      message: 'Successfully updated product history',
    };

  } catch (error) {
    console.error('Failed to update product history:', error);
    throw new Error('Server error while updating product history');
  }
};


export const productHistoryDelete = async (id) => {
  await connectDb();

  try {
    const newProductHistory = await ProductHistory.findByIdAndUpdate(
      id,
      {
        $set: {
          recordStatus: "deactivated",
          deactivatedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    );



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
      { productQuantity: totalproduct , productQuantityremaining: finalproduct},
      { new: true }
    );
    await recalculateProductQuantities();

    if (newProductHistory) {
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
