import { NextResponse } from 'next/server';
import { connectDB } from '@/db/connectDb';
import User from "@/models/User";
import ExtraExpense from "@/models/Extraexpenses";
import Invoice from "@/models/Invoice";
import ProductHistory from "@/models/ProductHistory";
import Product from "@/models/Products";
import Recharge from "@/models/Rechage";
import RechargeHistory from "@/models/RechargeHistory";
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';

const modelMap = {
    users: User,
    extraexpenses: ExtraExpense,
    invoices: Invoice,
    products: Product,
    producthistorys: ProductHistory,
    recharges: Recharge,
    rechagehistorys: RechargeHistory,

};



export const POST = async (req) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid or missing userId" }, { status: 400 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !file.name.endsWith(".zip")) {
            return NextResponse.json({ message: "Please upload a .zip file" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);
        const entries = zip.getEntries();

        await connectDB();

        const report = {};

        for (const entry of entries) {
            if (!entry.entryName.endsWith(".json")) continue;

            const key = entry.entryName.replace(".json", "").toLowerCase();
            const Model = modelMap[key];
            if (!Model) continue;

            const content = JSON.parse(entry.getData().toString("utf8"));
            if (!Array.isArray(content)) continue;

            const insertDocs = [];
            let skipped = 0;

            for (const doc of content) {
                if (!doc._id) continue;

                const exists = await Model.exists({
                    _id: new mongoose.Types.ObjectId(doc._id),
                    user: new mongoose.Types.ObjectId(userId),
                });

                if (!exists) {
                    const { _id, id, user, ...rest } = doc;
                    insertDocs.push({
                        ...rest,
                        _id: doc._id,
                        user: new mongoose.Types.ObjectId(userId),
                    });
                } else {
                    skipped++;
                }
            }

            if (insertDocs.length > 0) {
                await Model.insertMany(insertDocs, { ordered: false });
            }

            report[key] = {
                inserted: insertDocs.length,
                skipped,
            };
        }

        return NextResponse.json({
            message: "Backup imported with _id+user check",
            report,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Failed to import backup" }, { status: 500 });
    }
};