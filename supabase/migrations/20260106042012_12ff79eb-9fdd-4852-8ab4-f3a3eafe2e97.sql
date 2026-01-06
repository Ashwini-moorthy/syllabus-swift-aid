-- Fix handle_new_user function to add input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_grade INTEGER;
BEGIN
  -- Extract and validate name
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'name', 'Student');
  
  -- Truncate name if too long
  IF LENGTH(user_name) > 100 THEN
    user_name := SUBSTRING(user_name, 1, 100);
  END IF;
  
  -- Extract and validate grade
  BEGIN
    user_grade := COALESCE((NEW.raw_user_meta_data ->> 'grade')::INTEGER, 6);
  EXCEPTION WHEN OTHERS THEN
    user_grade := 6; -- Default to grade 6 if conversion fails
  END;
  
  -- Ensure grade is within valid range (6-9)
  IF user_grade < 6 OR user_grade > 9 THEN
    user_grade := 6;
  END IF;
  
  INSERT INTO public.profiles (user_id, name, grade)
  VALUES (NEW.id, user_name, user_grade);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;