-- ============================================================================
-- FOODHOME (푸드홈) 1차 마이그레이션: 홈페이지 공개 콘텐츠 저장 테이블 (site_contents)
-- ============================================================================
-- [안전 원칙]
-- 1. 기존 테이블(site_admins, form_definitions, form_submissions) 및 데이터를
--    절대 삭제하거나 수정하지 않습니다.
-- 2. 기존 is_site_admin() 함수와 기존 RLS 정책을 변경하지 않습니다.
-- 3. 공개 콘텐츠(회사소개, 배너, 제품, 공지, FAQ, 후기, 테마, SEO, 폼설정)만
--    저장하며, 고객 문의/견적/비밀번호 등 개인정보(inquiries, quotes)는
--    payload에 저장하지 않습니다.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_contents (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화 (반복 실행 가능)
ALTER TABLE public.site_contents ENABLE ROW LEVEL SECURITY;

-- 기존 정책 존재 여부를 확인하여 중복 없이 안전하게 정책 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_contents'
      AND policyname = 'Public can read site contents'
  ) THEN
    CREATE POLICY "Public can read site contents"
      ON public.site_contents
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_contents'
      AND policyname = 'Admins can manage site contents'
  ) THEN
    CREATE POLICY "Admins can manage site contents"
      ON public.site_contents
      FOR ALL
      TO authenticated
      USING (public.is_site_admin())
      WITH CHECK (public.is_site_admin());
  END IF;
END
$$;
