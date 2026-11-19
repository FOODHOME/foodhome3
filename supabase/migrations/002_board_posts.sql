-- ============================================================================
-- FOODHOME (푸드홈) 2차 마이그레이션: 게시판 원격 DB 동기화 & Storage 버킷 설정
-- ============================================================================
-- [안전 원칙]
-- 1. 기존 테이블(site_admins, site_contents, form_definitions, form_submissions)
--    및 기존 데이터를 절대 삭제하거나 수정하지 않습니다.
-- 2. 기존 is_site_admin() 함수 및 기존 RLS 정책을 변경하지 않습니다.
-- 3. 공개 게시판(board_posts)과 개인정보가 포함된 비공개 문의(board_private_inquiries)를
--    엄격히 분리하여, 일반 방문자에게 연락처/주소/이메일 등 개인정보가 절대 노출되지 않도록
--    RLS 및 SECURITY DEFINER 마스킹 조회 함수를 적용합니다.
-- 4. 이미지 대용량화(5MB localStorage 초과) 방지를 위해 'foodhome-media' Storage 버킷과
--    관리자 업로드 RLS 정책을 함께 안전하게 생성합니다.
-- ============================================================================

-- 1. 공개 게시판 전용 테이블 (공지사항 / 레시피 / 납품스토리 / 이벤트 / 공개 소통글)
CREATE TABLE IF NOT EXISTS public.board_posts (
  id TEXT PRIMARY KEY,
  board_type TEXT NOT NULL DEFAULT 'notice',
  category TEXT NOT NULL DEFAULT '공지사항',
  title TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '푸드홈',
  content TEXT NOT NULL,
  thumbnail TEXT DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  read_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_posts_created_at
  ON public.board_posts (is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_board_posts_category
  ON public.board_posts (category);

ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

-- 방문자 작성 공개글 수정/삭제용 비밀번호 해시 분리 테이블 (클라이언트에 해시 비노출)
CREATE TABLE IF NOT EXISTS public.board_post_secrets (
  post_id TEXT PRIMARY KEY REFERENCES public.board_posts(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_post_secrets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_posts'
      AND policyname = 'Public can read published board posts'
  ) THEN
    CREATE POLICY "Public can read published board posts"
      ON public.board_posts
      FOR SELECT
      TO public
      USING (is_secret = false AND status = 'published');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_posts'
      AND policyname = 'Public can create board posts'
  ) THEN
    CREATE POLICY "Public can create board posts"
      ON public.board_posts
      FOR INSERT
      TO public
      WITH CHECK (
        is_secret = false
        AND status = 'published'
        AND is_pinned = false
        AND char_length(trim(title)) > 0
        AND char_length(trim(content)) > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_posts'
      AND policyname = 'Admins can manage all board posts'
  ) THEN
    CREATE POLICY "Admins can manage all board posts"
      ON public.board_posts
      FOR ALL
      TO authenticated
      USING (public.is_site_admin())
      WITH CHECK (public.is_site_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_post_secrets'
      AND policyname = 'Admins can manage board post secrets'
  ) THEN
    CREATE POLICY "Admins can manage board post secrets"
      ON public.board_post_secrets
      FOR ALL
      TO authenticated
      USING (public.is_site_admin())
      WITH CHECK (public.is_site_admin());
  END IF;
END
$$;

-- 공개 게시글 조회수 증가용 안전 RPC
CREATE OR REPLACE FUNCTION public.increment_board_post_read(p_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next INTEGER;
BEGIN
  UPDATE public.board_posts
  SET read_count = COALESCE(read_count, 0) + 1
  WHERE id = p_id
    AND (is_secret = false OR public.is_site_admin())
  RETURNING read_count INTO v_next;

  RETURN COALESCE(v_next, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_board_post_read(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_board_post_read(TEXT) TO anon, authenticated;

-- 방문자 공개 게시글 작성 (선택적 수정/삭제 비밀번호 해시 포함)
CREATE OR REPLACE FUNCTION public.create_visitor_board_post(
  p_id TEXT,
  p_board_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_author_name TEXT,
  p_content TEXT,
  p_thumbnail TEXT DEFAULT '',
  p_tags JSONB DEFAULT '[]'::jsonb,
  p_password_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.board_posts%ROWTYPE;
BEGIN
  IF char_length(trim(COALESCE(p_title, ''))) = 0 OR char_length(trim(COALESCE(p_content, ''))) = 0 THEN
    RAISE EXCEPTION '제목과 본문을 입력해 주세요.';
  END IF;

  INSERT INTO public.board_posts (
    id, board_type, category, title, author_name, content, thumbnail, tags,
    is_pinned, is_secret, read_count, status, created_at, updated_at
  )
  VALUES (
    p_id,
    COALESCE(NULLIF(trim(p_board_type), ''), 'community'),
    COALESCE(NULLIF(trim(p_category), ''), '고객소통'),
    trim(p_title),
    COALESCE(NULLIF(trim(p_author_name), ''), '방문자'),
    trim(p_content),
    COALESCE(p_thumbnail, ''),
    COALESCE(p_tags, '[]'::jsonb),
    false,
    false,
    1,
    'published',
    now(),
    now()
  )
  RETURNING * INTO v_row;

  IF p_password_hash IS NOT NULL AND char_length(trim(p_password_hash)) > 0 THEN
    INSERT INTO public.board_post_secrets (post_id, password_hash)
    VALUES (v_row.id, trim(p_password_hash))
    ON CONFLICT (post_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

REVOKE ALL ON FUNCTION public.create_visitor_board_post(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_visitor_board_post(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

-- 방문자 공개 게시글 수정 (비밀번호 검증 또는 관리자)
CREATE OR REPLACE FUNCTION public.update_visitor_board_post(
  p_id TEXT,
  p_password_hash TEXT,
  p_title TEXT,
  p_content TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := public.is_site_admin();
  v_match BOOLEAN := false;
BEGIN
  IF NOT v_is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM public.board_post_secrets
      WHERE post_id = p_id AND password_hash = trim(COALESCE(p_password_hash, ''))
    ) INTO v_match;
    IF NOT v_match THEN
      RETURN false;
    END IF;
  END IF;

  UPDATE public.board_posts
  SET
    title = COALESCE(NULLIF(trim(p_title), ''), title),
    content = COALESCE(NULLIF(trim(p_content), ''), content),
    updated_at = now()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.update_visitor_board_post(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_visitor_board_post(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 방문자 공개 게시글 삭제 (비밀번호 검증 또는 관리자)
CREATE OR REPLACE FUNCTION public.delete_visitor_board_post(
  p_id TEXT,
  p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := public.is_site_admin();
  v_match BOOLEAN := false;
BEGIN
  IF NOT v_is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM public.board_post_secrets
      WHERE post_id = p_id AND password_hash = trim(COALESCE(p_password_hash, ''))
    ) INTO v_match;
    IF NOT v_match THEN
      RETURN false;
    END IF;
  END IF;

  DELETE FROM public.board_posts WHERE id = p_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_visitor_board_post(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_visitor_board_post(TEXT, TEXT) TO anon, authenticated;


-- ============================================================================
-- 2. 비공개 문의 게시판 분리 테이블 (샘플신청 & 1:1 대량 납품 견적 상담)
--    - 연락처/이메일/주소 등 개인정보 포함 -> 직접 SELECT는 관리자(is_site_admin)만 허용
--    - 일반 방문자는 마스킹 목록 RPC(get_public_inquiry_board) 및 비밀번호 검증 RPC
--      (unlock_private_inquiry)를 통해서만 본인 글 열람/수정/삭제 가능
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.board_private_inquiries (
  id TEXT PRIMARY KEY,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('sample', 'quote')),
  post_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  store_name TEXT DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  writer_masked TEXT NOT NULL DEFAULT '고객',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  region TEXT DEFAULT '',
  address TEXT DEFAULT '',
  business_type TEXT DEFAULT '',
  request_type TEXT DEFAULT '무료 샘플 요청',
  monthly_usage TEXT DEFAULT '',
  delivery_schedule TEXT DEFAULT '',
  selected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT '접수완료',
  read_count INTEGER NOT NULL DEFAULT 1,
  admin_reply JSONB,
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_private_inquiries_type_created
  ON public.board_private_inquiries (inquiry_type, created_at DESC);

ALTER TABLE public.board_private_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_private_inquiries'
      AND policyname = 'Public can submit private inquiries'
  ) THEN
    CREATE POLICY "Public can submit private inquiries"
      ON public.board_private_inquiries
      FOR INSERT
      TO public
      WITH CHECK (
        inquiry_type IN ('sample', 'quote')
        AND char_length(trim(title)) > 0
        AND char_length(trim(password_hash)) > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_private_inquiries'
      AND policyname = 'Admins can manage all private inquiries'
  ) THEN
    CREATE POLICY "Admins can manage all private inquiries"
      ON public.board_private_inquiries
      FOR ALL
      TO authenticated
      USING (public.is_site_admin())
      WITH CHECK (public.is_site_admin());
  END IF;
END
$$;

-- 일반 방문자용 마스킹 목록 조회 (개인정보 완전 분리: 전화번호/이메일/주소/메시지 미반환)
CREATE OR REPLACE FUNCTION public.get_public_inquiry_board(p_inquiry_type TEXT DEFAULT NULL)
RETURNS TABLE (
  id TEXT,
  inquiry_type TEXT,
  post_number INTEGER,
  title TEXT,
  writer_masked TEXT,
  store_masked TEXT,
  status TEXT,
  is_secret BOOLEAN,
  has_reply BOOLEAN,
  read_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.inquiry_type,
    i.post_number,
    regexp_replace(
      regexp_replace(COALESCE(i.title, ''), '\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}', '***-****', 'g'),
      '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
      '****@****',
      'g'
    ) AS title,
    COALESCE(NULLIF(i.writer_masked, ''), '고객') AS writer_masked,
    CASE
      WHEN char_length(COALESCE(NULLIF(i.store_name, ''), i.company_name, '')) <= 2
        THEN COALESCE(NULLIF(i.store_name, ''), i.company_name, '비공개')
      ELSE left(COALESCE(NULLIF(i.store_name, ''), i.company_name), 2) || '**'
    END AS store_masked,
    i.status,
    i.is_secret,
    (i.admin_reply IS NOT NULL) AS has_reply,
    COALESCE(i.read_count, 1) AS read_count,
    i.created_at
  FROM public.board_private_inquiries i
  WHERE (p_inquiry_type IS NULL OR i.inquiry_type = p_inquiry_type)
  ORDER BY i.created_at DESC, i.post_number DESC;
$$;

REVOKE ALL ON FUNCTION public.get_public_inquiry_board(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_inquiry_board(TEXT) TO anon, authenticated;

-- 비밀글 비밀번호 검증 후 단건 상세 조회 RPC
CREATE OR REPLACE FUNCTION public.unlock_private_inquiry(
  p_id TEXT,
  p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.board_private_inquiries%ROWTYPE;
  v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  SELECT * INTO v_row
  FROM public.board_private_inquiries
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', '게시글을 찾을 수 없습니다.');
  END IF;

  IF NOT v_is_admin THEN
    IF v_row.password_hash IS DISTINCT FROM trim(COALESCE(p_password_hash, '')) THEN
      RETURN jsonb_build_object('ok', false, 'error', '비밀번호가 일치하지 않습니다.');
    END IF;
  END IF;

  UPDATE public.board_private_inquiries
  SET read_count = COALESCE(read_count, 0) + 1
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'ok', true,
    'item', jsonb_build_object(
      'id', v_row.id,
      'inquiry_type', v_row.inquiry_type,
      'post_number', v_row.post_number,
      'title', v_row.title,
      'company_name', v_row.company_name,
      'store_name', v_row.store_name,
      'contact_person', v_row.contact_person,
      'writer_masked', v_row.writer_masked,
      'phone', v_row.phone,
      'email', v_row.email,
      'region', v_row.region,
      'address', v_row.address,
      'business_type', v_row.business_type,
      'request_type', v_row.request_type,
      'monthly_usage', v_row.monthly_usage,
      'delivery_schedule', v_row.delivery_schedule,
      'selected_products', v_row.selected_products,
      'attachments', v_row.attachments,
      'message', v_row.message,
      'is_secret', v_row.is_secret,
      'status', v_row.status,
      'read_count', v_row.read_count,
      'admin_reply', v_row.admin_reply,
      'admin_memo', CASE WHEN v_is_admin THEN v_row.admin_memo ELSE NULL END,
      'created_at', v_row.created_at
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_private_inquiry(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_private_inquiry(TEXT, TEXT) TO anon, authenticated;

-- 작성자 본인 수정 (비밀번호 검증) 또는 관리자 수정
CREATE OR REPLACE FUNCTION public.update_private_inquiry_with_password(
  p_id TEXT,
  p_password_hash TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  UPDATE public.board_private_inquiries
  SET
    title = COALESCE(NULLIF(trim(p_title), ''), title),
    message = COALESCE(p_message, message),
    updated_at = now()
  WHERE id = p_id
    AND (v_is_admin OR password_hash = trim(COALESCE(p_password_hash, '')));

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.update_private_inquiry_with_password(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_private_inquiry_with_password(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 작성자 본인 삭제 (비밀번호 검증) 또는 관리자 삭제
CREATE OR REPLACE FUNCTION public.delete_private_inquiry_with_password(
  p_id TEXT,
  p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  DELETE FROM public.board_private_inquiries
  WHERE id = p_id
    AND (v_is_admin OR password_hash = trim(COALESCE(p_password_hash, '')));

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_private_inquiry_with_password(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_private_inquiry_with_password(TEXT, TEXT) TO anon, authenticated;


-- ============================================================================
-- 3. 이미지 저장용 Supabase Storage 버킷 ('foodhome-media') 및 안전 RLS 정책
--    (localStorage 5MB 초과 방지: 이미지는 Storage URL로 분리 저장)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('foodhome-media', 'foodhome-media', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view foodhome media'
  ) THEN
    CREATE POLICY "Public can view foodhome media"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'foodhome-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload foodhome media'
  ) THEN
    CREATE POLICY "Admins can upload foodhome media"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update foodhome media'
  ) THEN
    CREATE POLICY "Admins can update foodhome media"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'foodhome-media' AND public.is_site_admin())
      WITH CHECK (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete foodhome media'
  ) THEN
    CREATE POLICY "Admins can delete foodhome media"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;
END
$$;
