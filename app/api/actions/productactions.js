"use server";

import connectDb from "@/db/connectDb"
import Product from "@/models/Products"
import ProductHistory from "@/models/ProductHistory";

export const fetchProducts = async (userId, status) => {
  await connectDb();

  const products = await Product.find({ user: userId, recordStatus: status }).sort({ date: -1 });

  if (!products || products.length === 0) {
    return {  };
  }
  const safeProducts = products.map(product =>product.toObject({ flattenObjectIds: true })
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

    if (productDel && productHistoryResult ) {
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
