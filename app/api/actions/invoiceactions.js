"use server"

import connectDB from "@/db/connectDb"
import Invoice from "@/models/Invoice";
import mongoose from "mongoose";
import Product from "@/models/Products";




// ADD invoice
export const ADDinvoice = async (data) => {
  try {
    await connectDB();
    console.log(data);

    if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
      return null;
    }

    if (!data.items.length || data.grandTotal <= 0) {
      return null;
    }

    const receivedAmount = parseFloat(data.received_amount) || 0;
    const balanceDue = parseFloat((data.grandTotal - receivedAmount).toFixed(2));

    const newInvoice = await Invoice.create({
      user: new mongoose.Types.ObjectId(data.userId),
      client: data.client,
      items: data.items,
      grandTotal: data.grandTotal,
      received_amount: receivedAmount,
      balance_due_amount: Math.max(balanceDue, 0),
      imageURL: data.imageURL,
    });

    // ✅ Update each product's quantity after invoice creation
    for (const item of data.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { productQuantityUse: item.item_quantity },
        },
        { new: true }
      );
    }

    return JSON.parse(JSON.stringify(newInvoice));
  } catch (error) {
    console.error("Error adding invoice:", error);
    return null;
  }
};


//fetch invoice


export const fetchInvoices = async (userId, status) => {
  await connectDB();
  try {
    const invoice = await Invoice.find({ user: userId, recordStatus: status }).sort({ date: -1 });

    if (!invoice || invoice.length === 0) {
      return {};
    }
    const safeinvoice = invoice.map(invoice => invoice.toObject({ flattenObjectIds: true })
    );

    return safeinvoice;
  } catch (error) {
    console.error('Failed to fetch invoices', error);
    throw new Error('Server error while fetch invoices');
  }
}






export const UpdateInvoice = async (data) => {
  await connectDB();

  try {
    // Step 1: Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      data._id,
      { ...data },
      { new: true }
    );

    if (!updatedInvoice) {
      return { status: 404, message: 'Invoice not found' };
    }

    // Step 2: Get all active products and active invoices
    const [activeProducts, activeInvoices] = await Promise.all([
      Product.find({ recordStatus: 'active' }),
      Invoice.find({ recordStatus: 'active' }),
    ]);

    // Step 3: For each product, calculate total used from all invoice items
    for (const product of activeProducts) {
      const productId = product._id.toString();
      let totalUsed = 0;

      for (const invoice of activeInvoices) {
        for (const item of invoice.items) {
          if (item.productId.toString() === productId) {
            totalUsed += parseInt(item.item_quantity);
          }
        }
      }

      // Step 4: Calculate remaining quantity
      const remainingQty = Math.max(totalUsed);

      // Step 5: Update productQuantityUse as remaining
      await Product.findByIdAndUpdate(productId, {
        productQuantityUse: remainingQty,
      });
    }

    return {
      status: 200,
      message: 'Invoice updated and product remaining quantities updated successfully.',
    };

  } catch (error) {
    console.error('Update error:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
};


//invoiceDelete

export const invoiceDelete = async (id) => {
  await connectDB();
  try {
    const DeleteInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          recordStatus: "deactivated",
          deactivatedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    );

    if (!DeleteInvoice) {
      return { status: 404, message: 'Invoice not found' };
    }
    // Step 2: Get all active products and active invoices
    const [activeProducts, activeInvoices] = await Promise.all([
      Product.find({ recordStatus: 'active' }),
      Invoice.find({ recordStatus: 'active' }),
    ]);

    // Step 3: For each product, calculate total used from all invoice items
    for (const product of activeProducts) {
      const productId = product._id.toString();
      let totalUsed = 0;

      for (const invoice of activeInvoices) {
        for (const item of invoice.items) {
          if (item.productId.toString() === productId) {
            totalUsed += parseInt(item.item_quantity);
          }
        }
      }

      // Step 4: Calculate remaining quantity
      const remainingQty = Math.max(0, product.productQuantity - totalUsed);

      // Step 5: Update productQuantityUse as remaining
      await Product.findByIdAndUpdate(productId, {
        productQuantityUse: remainingQty,
      });
    }

    return {
      status: 200,
      message: 'Invoice Delete successfully and product remaining quantities updated successfully.',
    };
    // return { status: 200, message: 'Invoice Delete successfully' };
  } catch (error) {
    console.error('Update error:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
}

//single invoice details
export const InvoiceDetails = async (id) => {
  console.log("object", id);
  await connectDB();
  try {
    const invoice = await Invoice.findOne({ _id: id });

    if (!invoice || invoice.length === 0) {
      return {};
    }
    // const safeinvoice = invoice.map(invoice => invoice.toObject({ flattenObjectIds: true })
    // );

    // return safeinvoice;
     return invoice.toObject({ flattenObjectIds: true });
  } catch (error) {
    console.error('Failed to fetch invoice', error);
    throw new Error('Server error while fetching invoice');
  }
};


export const RestoreInvoice = async (id) => {
  await connectDB();

  try {
    // Step 1: Restore the invoice
    const restoredInvoice = await Invoice.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          recordStatus: "active",
          deactivatedAt: null,
        },
      },
      { new: true }
    );

    if (!restoredInvoice) {
      return { error: "Invoice not found" };
    }

    // Step 2: Get active products and invoices
    const [activeProducts, activeInvoices] = await Promise.all([
      Product.find({ recordStatus: "active" }),
      Invoice.find({ recordStatus: "active" }),
    ]);

    // Step 3: Recalculate product usage
    for (const product of activeProducts) {
      const productId = product._id.toString();
      let totalUsed = 0;

      for (const invoice of activeInvoices) {
        for (const item of invoice.items) {
          if (item.productId.toString() === productId) {
            totalUsed += parseInt(item.item_quantity);
          }
        }
      }

      const remainingQty = Math.max(0, product.productQuantity - totalUsed);

      await Product.findByIdAndUpdate(productId, {
        productQuantityUse: remainingQty,
      });
    }

    return { success: true, message: "Invoice restored successfully" };

  } catch (error) {
    console.error("Error restoring invoice:", error);
    return { error: "Failed to restore invoice" };
  }
};
