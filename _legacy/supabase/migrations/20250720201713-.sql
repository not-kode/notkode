-- Create blog_posts table for Notkode blog system
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_pt TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category_pt TEXT NOT NULL,
  category_en TEXT NOT NULL,
  cover_image TEXT,
  publish_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author TEXT NOT NULL DEFAULT 'Notkode Team',
  slug_pt TEXT NOT NULL UNIQUE,
  slug_en TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  excerpt_pt TEXT,
  excerpt_en TEXT,
  meta_title_pt TEXT,
  meta_title_en TEXT,
  meta_description_pt TEXT,
  meta_description_en TEXT,
  og_image TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (blog posts are public)
CREATE POLICY "Blog posts are publicly readable" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_publish_date ON public.blog_posts(publish_date DESC);
CREATE INDEX idx_blog_posts_slug_pt ON public.blog_posts(slug_pt);
CREATE INDEX idx_blog_posts_slug_en ON public.blog_posts(slug_en);
CREATE INDEX idx_blog_posts_category_pt ON public.blog_posts(category_pt);
CREATE INDEX idx_blog_posts_category_en ON public.blog_posts(category_en);

-- Enable realtime for blog posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;