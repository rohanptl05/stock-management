"use server";

import connectDb from "@/db/connectDb"
import Product from "@/models/Products"


export const fetchProducts = async (userId) => {
    await connectDb();

    let products = await Product.find({ user: userId, recordStatus: "active" })
        .sort({ date: -1 })
        .lean();
    if (!products) {
        return { error: "No products found" };
    }

    return products.map(product => product.toObject({ flattenObjectIds: true }));
}


export default async function createProduct(data) {
    await connectDb();

    let ndata = { ...data };

    // Check if the product already exists
    let existingProduct = await Product.findOne({ productName: ndata.productName });
    if (existingProduct) {  
        return { error: "Product Name already exists" };
    }      
    // Create a new product
    let newProduct = await Product.create(ndata); 
    
    
    if (!newProduct) {
        return { error: "Failed to create product" };
    }
    return { status: 200, message: "Product created successfully" };
 }