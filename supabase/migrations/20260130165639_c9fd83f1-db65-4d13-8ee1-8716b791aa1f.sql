-- Allow authenticated users to insert tests (for saving generated quiz questions)
CREATE POLICY "Authenticated users can insert tests"
ON public.tests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert their own test results
-- (Policy already exists but let's ensure it's correct)