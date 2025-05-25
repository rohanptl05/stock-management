"use server"

import connectDB from "@/db/connectDb"
import  ExtraExpense  from "@/models/Extraexpenses";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


export const ADDExpense = async (data) => {
    try {
      await connectDB();
 
  
      if (!data.user || !mongoose.Types.ObjectId.isValid(data.user)) {
        console.error("Invalid user ID");
        return null;
      }
      const isValidDate = (d) => !isNaN(new Date(d).getTime());
      const newExpense = new ExtraExpense({
        user: data.user,
        amount: data.amount,
        expensetype: data.type,
        description: data.description || "",
        date: isValidDate(data.date) ? new Date(data.date) : new Date(),
      });
  
      await newExpense.save();
  
      return { success: "Payment history saved successfully" };
    } catch (error) {
      console.error("Error adding expense:", error);
      return null;
    }
  };

  export const GETExpense = async (userId,status) => {
    try {
      await connectDB();
   
      const expenses = await ExtraExpense.find({ user: userId,recordStatus:status }).select("amount date expensetype description ").sort({ date: -1 });
      
      return expenses.map(expenses => expenses.toObject({ flattenObjectIds: true }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return null;
    }
  }
  


  export const DeleteExinvoices = async (id) => {
      try {
        await connectDB(); 
    
       
        const Exinvoice = await ExtraExpense.findById(id);
        if (!Exinvoice) {
          return { error: "ExInvoice not found" };
        }
        try {
          await ExtraExpense.findOneAndUpdate(
            { _id: id }, 
            { $set: {
                recordStatus: "deactivated" ,
                deactivatedAt: new Date() 
    
            } }, 
            { new: true }  
        );
          
        } catch (error) {
          console.error("Error deleting invoice:", error);
          return { error: "Failed to delete invoice" };
          
        }
   
    
        return { success: true, message: "ExInvoice deleted successfully" };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
      }
    };







    export const EditExpense = async (id ,data) => {
        await connectDB();
      
        let invoiceExists = await ExtraExpense.findOne({ _id: id });
    
        if (!invoiceExists) {
            return { error: "Invoice does not exist" };
        }
    
        try {
            // ✅ Ensure status is updated correctly
    
            await ExtraExpense.findOneAndUpdate(
                { _id: id },
                { $set: data },
                { new: true, runValidators: true }
            );
    
            // ✅ Delete old payment history if grandTotal changes
          
    
            return { success: true, message: "ExInvoice updated successfully" };
        } catch (error) {
            console.error("Error updating invoice:", error);
            return { error: "Failed to update invoice" };
        }
    };
    
    export const GETExpenseDeactiveted = async (id) => {
        try {
          await connectDB();

          const expense = await ExtraExpense.find({user:id,recordStatus:"deactivated"}).sort({ date: -1 });
    
          if (!expense) {
            return { error: "No deactivated expenses found" };
          }
          return expense.map(expense => expense.toObject({ flattenObjectIds: true }));
        } catch (error) {
          console.error("Error fetching expense by ID:", error);
          return null;
        }
      }


export const RestoreExtraInvoice = async (id) => {
    try {
        await connectDB(); 
    
        const invoice = await ExtraExpense.findById(id);
        if (!invoice) {
          return { error: "Invoice not found" };
        }
        try {
          await ExtraExpense.findOneAndUpdate(
            { _id: id },  
            {
                $set: {
                    recordStatus: "active",
                    deactivatedAt: null
                }
            },
            { new: true }
          );
    
        } catch (error) {
          console.error("Error deleting invoice:", error);
          return { error: "Failed to delete invoice" };
    
        }
    
        return { success: true, message: "Invoice deleted successfully" };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
      }
    }