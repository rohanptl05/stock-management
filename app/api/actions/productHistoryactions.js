"use server";

import connectDb from "@/db/connectDb"
import Product from "@/models/Products"
import ProductHistory from "@/models/ProductHistory";
import { updateProduct } from "./productactions";

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

  let newProductHistory = await ProductHistory.create({
    product: ndata._id,
    user: ndata.user,
    productId: ndata.productId,
    productQuantity: ndata.productQuantity,

  });

  return { status: 200, message: "Product created successfully" };
}


export const updateProductHistory = async (data) => {
  await connectDb();

  try {
    const updatedHistory = await ProductHistory.findByIdAndUpdate(
      data._id,
      {
        $set: {
           productQuantity: data.productQuantity ,
          date: data.date ,
        }
      },
      { new: true } // Return the updated document
    );
   if (!updatedHistory) {
      return {
        status: 404,
        message: 'Product history not found',
      };
    }
  

 const productId = updatedHistory.product;
 
    const activeHistories = await ProductHistory.find({
      product: productId,
      recordStatus: "active"
    });

    const totalQuantity = activeHistories.reduce((sum, record) => sum + (record.productQuantity || 0), 0);

    await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          productQuantity: totalQuantity
        }
      }
    );

    

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
    const updatedHistory = await ProductHistory.findByIdAndUpdate(
      id,
      {
        $set: {
          recordStatus: "deactivated",
          deactivatedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    );



    console.log("object",updatedHistory.product)

const productId = updatedHistory.product;
 
    const activeHistories = await ProductHistory.find({
      product: productId,
      recordStatus: "active"
    });

    const totalQuantity = activeHistories.reduce((sum, record) => sum + (record.productQuantity || 0), 0);

    await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          productQuantity: totalQuantity
        }
      }
    );



    if (updatedHistory) {
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
