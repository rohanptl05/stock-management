import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import { Parser as Json2csvParser } from "json2csv";
import formidable from "formidable";
import { parse as csvParse } from "csv-parse/sync";
import { exportUserData } from "@/db/exportData/exportUserData.js";
import { Readable } from "stream";
import { readFile } from "fs/promises";



import User from "@/models/User";
import ExtraExpense from "@/models/Extraexpenses";
import Invoice from "@/models/Invoice";
import ProductHistory from "@/models/ProductHistory";
import Product from "@/models/Products";
import Recharge from "@/models/Rechage";
import RechargeHistory from "@/models/RechargeHistory";
import archiver from "archiver";






export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const format = searchParams.get("format") || "json";

  try {
    await connectDB();
    const data = await exportUserData(userId);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const stream = new Readable({ read() { } });

    for (const [key, value] of Object.entries(data)) {
      const filename = `${key}.${format}`;

      let content;
      if (format === "csv") {
        const parser = new Json2csvParser({ flatten: true });
        content = parser.parse(value);
      } else {
        content = JSON.stringify(value, null, 2);
      }

      archive.append(content, { name: filename });
    }

    // Finalize zip creation
    archive.finalize();

    return new Response(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="backup_${userId}_${format}.zip"`,
      },
    });
  } catch (error) {
    console.error("ZIP Export Failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}


const modelMap = {
  users: User,
  extraexpenses: ExtraExpense,
  invoices: Invoice,
    products: Product,
    producthistorys: ProductHistory,
    recharges: Recharge,
    rechagehistorys: RechargeHistory,

 
};

export const config = {
  api: { bodyParser: false },
};



export async function POST(request) {
  try {
    const form = formidable({ multiples: false });

    // Convert WebRequest to Node stream
    const req = request;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file;
    const userId = fields.userId;

    const fileName = file.originalFilename.toLowerCase();
    const baseName = fileName.replace(".json", "").replace(".csv", "");

    const Model = modelMap[baseName];
    if (!Model) {
      return NextResponse.json({ error: `Unsupported model: ${baseName}` }, { status: 400 });
    }

    const fileContent = await readFile(file.filepath, "utf-8");
    let parsedData;

    if (fileName.endsWith(".json")) {
      parsedData = JSON.parse(fileContent);
    } else if (fileName.endsWith(".csv")) {
      parsedData = csvParse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });
    } else {
      return NextResponse.json({ error: "Only .json or .csv files are supported" }, { status: 400 });
    }

    await connectDB();

    const enriched = parsedData.map((item) => ({
      ...item,
      user: userId,
      recordStatus: "active",
    }));

    await Model.insertMany(enriched);

    return NextResponse.json({
      success: true,
      message: `${baseName} imported successfully`,
    });
  } catch (err) {
    console.error("Import failed:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}