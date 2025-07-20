import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import WhatsAppButton from '@/components/WhatsAppButton';

interface BlogPost {
  id: string;
  title_pt: string;
  title_en: string;
  content_pt: string;
  content_en: string;
  category_pt: string;
  category_en: string;
  cover_image?: string;
  publish_date: string;
  author: string;
  slug_pt: string;
  slug_en: string;
  excerpt_pt?: string;
  excerpt_en?: string;
  meta_title_pt?: string;
  meta_title_en?: string;
  meta_description_pt?: string;
  meta_description_en?: string;
  og_image?: string;
  views: number;
  tags?: string[];
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug, language]);

  useEffect(() => {
    if (post) {
      updateMetaTags();
      fetchRelatedPosts();
      incrementViews();
    }
  }, [post]);

  const fetchPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .or(`slug_pt.eq.${slug},slug_en.eq.${slug}`)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const category = language === 'pt' ? post.category_pt : post.category_en;
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('id', post.id)
        .or(`category_pt.ilike.%${category}%,category_en.ilike.%${category}%`)
        .eq('status', 'published')
        .limit(3)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const incrementViews = async () => {
    if (!post) return;

    try {
      await supabase
        .from('blog_posts')
        .update({ views: post.views + 1 })
        .eq('id', post.id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const updateMetaTags = () => {
    if (!post) return;

    const title = language === 'pt' ? 
      (post.meta_title_pt || post.title_pt) : 
      (post.meta_title_en || post.title_en);
    
    const description = language === 'pt' ? 
      (post.meta_description_pt || post.excerpt_pt) : 
      (post.meta_description_en || post.excerpt_en);

    // Update document title
    document.title = `${title} | Notkode Blog`;

    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || '');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description || '');
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && (post.og_image || post.cover_image)) {
      ogImage.setAttribute('content', post.og_image || post.cover_image || '');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTitle = (post: BlogPost) => {
    return language === 'pt' ? post.title_pt : post.title_en;
  };

  const getContent = (post: BlogPost) => {
    return language === 'pt' ? post.content_pt : post.content_en;
  };

  const getCategory = (post: BlogPost) => {
    return language === 'pt' ? post.category_pt : post.category_en;
  };

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: getTitle(post),
        text: post.excerpt_pt || post.excerpt_en || '',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const getPostUrl = (post: BlogPost) => {
    const slug = language === 'pt' ? post.slug_pt : post.slug_en;
    return `/blog/${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <p className="text-muted-foreground mb-6">O post que você procura não existe ou foi removido.</p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/blog" 
          className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Category */}
          <div className="text-primary font-semibold mb-4">
            {getCategory(post)}
          </div>

          {/* Title */}
          <h1 className="font-sora font-bold text-4xl md:text-5xl mb-6 leading-tight">
            {getTitle(post)}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-between text-muted-foreground mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publish_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{post.views} visualizações</span>
              </div>
              <span>Por {post.author}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={sharePost}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden mb-8">
              <img 
                src={post.cover_image} 
                alt={getTitle(post)}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card prose prose-lg max-w-none">
            <div 
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getContent(post) }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 p-6 glass rounded-2xl">
              <h3 className="font-semibold mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="glass-card">
              <h3 className="font-sora font-bold text-2xl mb-4">
                Gostou do conteúdo?
              </h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato conosco e descubra como podemos ajudar seu negócio com tecnologia.
              </p>
              <WhatsAppButton />
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto">
            <h2 className="font-sora font-bold text-3xl text-center mb-12">
              Posts <span className="text-gradient">Relacionados</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id}
                  to={getPostUrl(relatedPost)}
                  className="blog-card group"
                >
                  {relatedPost.cover_image && (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-4 overflow-hidden">
                      <img 
                        src={relatedPost.cover_image} 
                        alt={getTitle(relatedPost)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="text-sm font-semibold text-primary mb-2">
                    {getCategory(relatedPost)}
                  </div>
                  
                  <h3 className="font-sora font-bold text-lg mb-3 group-hover:text-primary transition-colors">
                    {getTitle(relatedPost)}
                  </h3>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(relatedPost.publish_date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;