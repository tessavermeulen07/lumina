-- Private bucket for inline journal images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'entry-images',
    'entry-images',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can upload own entry images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own entry images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own entry images" ON storage.objects;

CREATE POLICY "Users can upload own entry images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'entry-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view own entry images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'entry-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own entry images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'entry-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
