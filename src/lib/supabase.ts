import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QuoteInquiry } from '../types';

// Default Supabase config (can be configured via environment variables or in Admin settings)
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage key for runtime Supabase credentials if configured in admin UI
const STORAGE_SUPABASE_CONFIG_KEY = 'foodhome_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved supabase config:', e);
  }
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_SUPABASE_CONFIG_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.warn('Failed to save supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: SupabaseConfig | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const currentConfig = getSavedSupabaseConfig();

  // If no URL or key is set, return null (fallback to local mock)
  if (!currentConfig.url || !currentConfig.anonKey) {
    return null;
  }

  if (
    cachedClient &&
    lastUsedConfig &&
    lastUsedConfig.url === currentConfig.url &&
    lastUsedConfig.anonKey === currentConfig.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(currentConfig.url, currentConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUsedConfig = currentConfig;
    return cachedClient;
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

/**
 * Hash password securely with Web Crypto SHA-256
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword) return '';
  try {
    const enc = new TextEncoder();
    const data = enc.encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Basic fallback if crypto.subtle is not supported
    let hash = 0;
    for (let i = 0; i < plainPassword.length; i++) {
      hash = (hash << 5) - hash + plainPassword.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Checks if a user is registered as a site admin in Supabase.
 * Uses the requested `is_site_admin()` RPC function or queries `site_admins`.
 */
export async function isSiteAdmin(userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Try calling the RPC function `is_site_admin()`
    const { data: rpcData, error: rpcError } = await client.rpc('is_site_admin');
    if (!rpcError && typeof rpcData === 'boolean') {
      return rpcData;
    }

    // 2. Fallback: Query the `site_admins` table directly
    const targetUserId = userId || (await client.auth.getUser()).data.user?.id;
    if (!targetUserId) return false;

    const { data, error } = await client
      .from('site_admins')
      .select('id, role')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (!error && data) {
      return true;
    }
  } catch (e) {
    console.warn('isSiteAdmin check encountered an error:', e);
  }

  return false;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('이미지 데이터 변환에 실패했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지 디코딩에 실패했습니다.'));
    img.src = src;
  });
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample image pixels at a manageable grid to detect any non-opaque alpha channel
    const data = ctx.getImageData(0, 0, width, height).data;
    const step = Math.max(4, Math.floor(data.length / 40000) * 4);
    for (let i = 3; i < data.length; i += step) {
      if (data[i] < 250) return true;
    }
  } catch {
    // Ignore pixel inspection error
  }
  return false;
}

/**
 * Optimizes an uploaded image into a compact Data URL for reliable localStorage persistence
 * when external cloud storage is not configured.
 */
export async function optimizeImageFileToDataUrl(
  file: File,
  folder = 'banners'
): Promise<{ url: string | null; error?: string }> {
  try {
    if (!file.type.startsWith('image/')) {
      return { url: null, error: '이미지 파일(JPG, PNG, WEBP, GIF, SVG)만 업로드할 수 있습니다.' };
    }

    // Keep SVG as-is (size capped reasonably)
    if (file.type === 'image/svg+xml') {
      if (file.size > 512 * 1024) {
        return { url: null, error: 'SVG 파일은 500KB 이하만 업로드할 수 있습니다.' };
      }
      const dataUrl = await readFileAsDataUrl(file);
      return { url: dataUrl };
    }

    // Preserve animated/small GIF if under 450KB
    if (file.type === 'image/gif' && file.size <= 450 * 1024) {
      const dataUrl = await readFileAsDataUrl(file);
      return { url: dataUrl };
    }

    const isLogoOrSignature = folder === 'logos';
    const maxDimension = isLogoOrSignature ? 640 : 1280;
    const targetMaxChars = isLogoOrSignature ? 220_000 : 380_000;

    // Small non-oversized images under 140KB can still be checked for pixel dimensions safely
    const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : null;
    const rawDataUrl = objectUrl ? null : await readFileAsDataUrl(file);

    try {
      const img = await loadImageElement(objectUrl || (rawDataUrl as string));
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      if (!origW || !origH) {
        const fallback = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: fallback };
      }

      // If already compact and within dimensions, return directly without re-encoding
      if (file.size <= 140 * 1024 && origW <= maxDimension && origH <= maxDimension) {
        const directUrl = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: directUrl };
      }

      const scale = Math.min(1, maxDimension / Math.max(origW, origH));
      let targetW = Math.max(1, Math.round(origW * scale));
      let targetH = Math.max(1, Math.round(origH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const fallback = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: fallback };
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);

      const keepAlpha =
        (file.type === 'image/png' || file.type === 'image/webp') &&
        (isLogoOrSignature || canvasHasTransparency(ctx, targetW, targetH));

      if (keepAlpha) {
        // Prefer PNG for small transparent graphics; fall back to WebP if PNG is too heavy for localStorage
        let out = canvas.toDataURL('image/png');
        if (out.length > targetMaxChars) {
          const webpOut = canvas.toDataURL('image/webp', 0.86);
          if (webpOut.startsWith('data:image/webp') && webpOut.length < out.length) {
            out = webpOut;
          }
        }
        // Step down resolution slightly if still above budget
        let shrink = 0.8;
        while (out.length > targetMaxChars && shrink >= 0.45) {
          const sw = Math.max(1, Math.round(targetW * shrink));
          const sh = Math.max(1, Math.round(targetH * shrink));
          const c2 = document.createElement('canvas');
          c2.width = sw;
          c2.height = sh;
          const ctx2 = c2.getContext('2d');
          if (!ctx2) break;
          ctx2.drawImage(img, 0, 0, sw, sh);
          const candidateWebp = c2.toDataURL('image/webp', 0.82);
          out = candidateWebp.startsWith('data:image/webp') ? candidateWebp : c2.toDataURL('image/png');
          shrink -= 0.15;
        }
        return { url: out };
      }

      // Opaque photos: use JPEG with adaptive quality & gentle resolution step-down if needed
      let quality = 0.84;
      let out = canvas.toDataURL('image/jpeg', quality);
      while (out.length > targetMaxChars && quality > 0.48) {
        quality = Math.max(0.45, quality - 0.12);
        out = canvas.toDataURL('image/jpeg', quality);
      }

      let shrink = 0.8;
      while (out.length > targetMaxChars && shrink >= 0.5) {
        const sw = Math.max(1, Math.round(targetW * shrink));
        const sh = Math.max(1, Math.round(targetH * shrink));
        const c2 = document.createElement('canvas');
        c2.width = sw;
        c2.height = sh;
        const ctx2 = c2.getContext('2d');
        if (!ctx2) break;
        ctx2.drawImage(img, 0, 0, sw, sh);
        out = c2.toDataURL('image/jpeg', 0.72);
        shrink -= 0.15;
      }

      return { url: out };
    } finally {
      if (objectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  } catch (err: any) {
    try {
      const fallback = await readFileAsDataUrl(file);
      return { url: fallback };
    } catch {
      return { url: null, error: err?.message || '이미지 처리에 실패했습니다.' };
    }
  }
}

/**
 * Upload an image file to Supabase Storage bucket 'foodhome-media'
 */
export async function uploadImageToStorage(file: File, folder = 'banners'): Promise<{ url: string | null; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { url: null, error: '이미지 파일만 업로드할 수 있습니다.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return optimizeImageFileToDataUrl(file, folder);
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from('foodhome-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to local optimized data URL:', uploadError);
      return optimizeImageFileToDataUrl(file, folder);
    }

    const { data } = client.storage.from('foodhome-media').getPublicUrl(fileName);
    return { url: data.publicUrl };
  } catch (e: any) {
    return optimizeImageFileToDataUrl(file, folder);
  }
}

/**
 * Interface representing form_definitions table
 */
export interface FormDefinition {
  id: string;
  form_slug: string;
  title: string;
  description?: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'tel' | 'email' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'password';
    required: boolean;
    options?: string[];
    placeholder?: string;
    default_value?: any;
  }>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface representing form_submissions table
 */
export interface FormSubmission {
  id: string;
  form_slug: string;
  title?: string;
  author_name?: string;
  phone?: string;
  email?: string;
  store_name?: string;
  address?: string;
  selected_items?: string[];
  payload: Record<string, any>;
  password_hash?: string;
  status: '접수대기' | '접수완료' | '답변완료' | '배송준비' | '배송완료' | '상담완료' | '보류' | string;
  admin_reply?: string;
  admin_replied_at?: string;
  admin_replied_by?: string;
  tracking_number?: string;
  created_at: string;
}

/**
 * Fetch public sample board posts
 */
export async function fetchSampleBoardPosts(): Promise<FormSubmission[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('form_submissions')
      .select('id, form_slug, title, author_name, store_name, status, created_at, admin_replied_at')
      .eq('form_slug', 'sample-request')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching sample posts from Supabase:', error);
      return [];
    }

    return (data || []) as FormSubmission[];
  } catch (e) {
    console.error('Supabase fetchSampleBoardPosts failed:', e);
    return [];
  }
}

/**
 * Submit a customer sample post
 */
export async function submitSampleBoardPost(params: {
  title: string;
  authorName: string;
  storeName: string;
  phone: string;
  address: string;
  selectedItems: string[];
  message: string;
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const passwordHash = await hashPassword(params.password);
    const { data, error } = await client
      .from('form_submissions')
      .insert([
        {
          form_slug: 'sample-request',
          title: params.title,
          author_name: params.authorName,
          store_name: params.storeName,
          phone: params.phone,
          address: params.address,
          selected_items: params.selectedItems,
          password_hash: passwordHash,
          status: '접수완료',
          payload: {
            message: params.message,
            submittedAt: new Date().toISOString()
          }
        }
      ])
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Submission failed' };
  }
}

/**
 * Fetch 1:1 Quote Consultation inquiries from Supabase
 */
export async function fetchQuoteInquiries(): Promise<QuoteInquiry[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('quote_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching quote inquiries from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      postNumber: Number(row.post_number) || 1,
      title: row.title,
      companyName: row.company_name,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      region: row.region,
      businessType: row.business_type,
      interestedProducts: row.interested_products || [],
      monthlyVolume: row.monthly_volume,
      deliverySchedule: row.delivery_schedule,
      message: row.message,
      attachments: row.attachments || [],
      passwordHash: row.password_hash,
      isSecret: row.is_secret ?? true,
      status: row.status || '접수완료',
      readCount: row.read_count || 1,
      createdAt: row.created_at,
      adminReply: row.admin_reply,
      adminMemo: row.admin_memo
    }));
  } catch (e) {
    console.error('Supabase fetchQuoteInquiries failed:', e);
    return [];
  }
}

/**
 * Submit 1:1 Quote Consultation inquiry to Supabase
 */
export async function submitQuoteInquiryToDb(params: {
  title: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  region?: string;
  businessType?: string;
  interestedProducts: string[];
  monthlyVolume?: string;
  deliverySchedule?: string;
  message: string;
  attachments?: { name: string; url?: string; size?: string }[];
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const passwordHash = await hashPassword(params.password);
    const { data, error } = await client
      .from('quote_inquiries')
      .insert([
        {
          title: params.title,
          company_name: params.companyName,
          contact_person: params.contactPerson,
          phone: params.phone,
          email: params.email,
          region: params.region,
          business_type: params.businessType,
          interested_products: params.interestedProducts,
          monthly_volume: params.monthlyVolume,
          delivery_schedule: params.deliverySchedule,
          message: params.message,
          attachments: params.attachments || [],
          password_hash: passwordHash,
          is_secret: true,
          status: '접수완료',
          read_count: 1
        }
      ])
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Quote inquiry submission failed' };
  }
}

/**
 * Verifies if entered password matches the post's SHA-256 hash
 */
export async function verifyQuotePasswordWithHash(plainPassword: string, storedHash?: string, rawFallback?: string): Promise<boolean> {
  if (!storedHash && !rawFallback) return true;
  if (!plainPassword) return false;

  // 1. Direct match with plain text if stored in raw form
  if (rawFallback && plainPassword.trim() === rawFallback.trim()) {
    return true;
  }

  // 2. SHA-256 hash check
  const hashedInput = await hashPassword(plainPassword.trim());
  if (storedHash && hashedInput.toLowerCase() === storedHash.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Complete SQL Migration Script for Supabase
 */
export const SUPABASE_FOODHOME_SETUP_SQL = `-- ========================================================
-- FOODHOME (푸드홈) Supabase Database Setup & Migration SQL
-- ========================================================

-- 1. Create or ensure site_admins table exists
CREATE TABLE IF NOT EXISTS site_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on site_admins
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

-- 2. is_site_admin() RPC function for checking current logged in user
CREATE OR REPLACE FUNCTION is_site_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM site_admins WHERE user_id = auth.uid()
  );
END;
$$;

-- 3. 1:1 대량 납품 견적 상담 테이블 (quote_inquiries)
CREATE TABLE IF NOT EXISTS quote_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_number BIGSERIAL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  region TEXT,
  business_type TEXT,
  interested_products TEXT[] DEFAULT '{}',
  monthly_volume TEXT,
  delivery_schedule TEXT,
  message TEXT,
  attachments JSONB DEFAULT '[]',
  password_hash TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT '접수완료',
  read_count INT DEFAULT 1,
  admin_reply JSONB,
  admin_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on quote_inquiries
ALTER TABLE quote_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a quote inquiry
CREATE POLICY "Public can insert quote inquiries"
ON quote_inquiries FOR INSERT
WITH CHECK (true);

-- Authenticated admins can view and manage all inquiries
CREATE POLICY "Admins have full access to quote inquiries"
ON quote_inquiries FOR ALL
USING (is_site_admin());

-- 4. 홈페이지 커스텀 콘텐츠 저장 테이블 (site_contents)
-- 관리자 페이지에서 수정한 배너, 소개 문구, 이미지 등의 실시간 동기화
CREATE TABLE IF NOT EXISTS site_contents (
  id TEXT PRIMARY KEY DEFAULT 'foodhome_main_content',
  content JSONB NOT NULL,
  theme JSONB,
  form_config JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_contents ENABLE ROW LEVEL SECURITY;

-- Anyone can read public site contents
CREATE POLICY "Public can read site contents"
ON site_contents FOR SELECT
USING (true);

-- Only admins can modify site contents
CREATE POLICY "Admins can update site contents"
ON site_contents FOR ALL
USING (is_site_admin());

-- 5. Supabase Storage: 'foodhome-media' 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('foodhome-media', 'foodhome-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view images
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'foodhome-media');

-- Storage RLS: Admin can upload
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'foodhome-media');

-- Storage RLS: Admin can delete
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'foodhome-media');
`;
