import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Allowed MIME types and extensions to prevent arbitrary script/executable upload
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB Limit

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Only OWNER can upload files.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // 1. Security Check: File Size Limit (Prevent Disk Exhaustion DoS)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 50MB.' }, { status: 400 });
    }

    // 2. Security Check: MIME Type & Extension Whitelisting (Prevent Arbitrary File / Script Upload)
    const rawExt = file.name.split('.').pop() || '';
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, ''); // Sanitize extension

    if (!ALLOWED_EXTENSIONS.has(ext) || (file.type && !ALLOWED_MIME_TYPES.has(file.type))) {
      return NextResponse.json({ 
        error: 'Format file tidak diizinkan. Hanya menerima gambar (JPG, PNG, WEBP, GIF) dan video (MP4, WEBM, MOV).' 
      }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const mediaType = ext.match(/^(mp4|webm|mov)$/) ? 'VIDEO' : 'IMAGE';

    let finalBuffer = rawBuffer;
    let finalExt = ext;
    let finalMimeType = file.type || (mediaType === 'VIDEO' ? 'video/mp4' : 'image/png');

    // Automatically convert and compress static images (JPG, PNG, WEBP) to optimized WebP!
    if (mediaType === 'IMAGE' && ext !== 'gif') {
      try {
        finalBuffer = await sharp(rawBuffer)
          .webp({ quality: 80, effort: 4 })
          .toBuffer();
        finalExt = 'webp';
        finalMimeType = 'image/webp';
      } catch (err) {
        console.warn('Sharp WebP conversion failed, falling back to original buffer:', err);
      }
    }

    // Safe randomized filename preventing path traversal and file overwrite
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${finalExt}`;
    
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, finalBuffer);

    const url = `/uploads/${filename}`;

    // Save to DB
    const media = await prisma.media.create({
      data: {
        userId: session.user.id,
        type: mediaType,
        url,
        publicId: filename,
        mimeType: finalMimeType,
        sizeBytes: finalBuffer.length,
      }
    });

    return NextResponse.json({ url, mediaId: media.id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
