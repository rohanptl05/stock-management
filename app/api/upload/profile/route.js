import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";

export const POST = async (req) => {
   const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const oldImagePath = searchParams.get("oldImage"); // <-- Receive old image path

  const data = await req.formData();
  const file = data.get("image");

  if (!file || !file.name) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${uuidv4()}_${file.name.replace(/\s+/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // ✅ Delete old image if path is provided
    if (oldImagePath) {
      const oldPath = path.join(process.cwd(), "public", oldImagePath);
      try {
        await fs.unlink(oldPath);
        console.log("Old image deleted:", oldImagePath);
      } catch (err) {
        console.warn("Could not delete old image:", err.message);
      }
    }

    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
};
