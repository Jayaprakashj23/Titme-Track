-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  department TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for time_entries table
CREATE POLICY "Employees can view own time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can update own time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all time entries" ON public.time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX time_entries_employee_id_idx ON public.time_entries(employee_id);
CREATE INDEX time_entries_date_idx ON public.time_entries(date);
CREATE INDEX time_entries_clock_out_idx ON public.time_entries(clock_out) WHERE clock_out IS NULL;

-- Insert demo data (optional)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@demo.com', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'employee@demo.com', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW());

INSERT INTO public.profiles (id, email, name, role, department, position)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@demo.com', 'Demo Admin', 'admin', NULL, NULL),
  ('00000000-0000-0000-0000-000000000002', 'employee@demo.com', 'Demo Employee', 'employee', 'Engineering', 'Software Developer');