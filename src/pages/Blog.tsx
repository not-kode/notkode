import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  views: number;
}

const Blog: React.FC = () => {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'desenvolvimento', label: 'Desenvolvimento No-Code/Low-Code' },
    { value: 'ia', label: 'Inteligência Artificial' },
    { value: 'automacao', label: 'Automações' },
    { value: 'cases', label: 'Cases de Sucesso' },
    { value: 'tendencias', label: 'Tendências de Tecnologia' },
    { value: 'negocios', label: 'Dicas de Negócio' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory, language]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => {
        const title = language === 'pt' ? post.title_pt : post.title_en;
        const content = language === 'pt' ? post.content_pt : post.content_en;
        const searchLower = searchTerm.toLowerCase();
        return title.toLowerCase().includes(searchLower) || 
               content.toLowerCase().includes(searchLower);
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => {
        const category = language === 'pt' ? post.category_pt : post.category_en;
        return category.toLowerCase().includes(selectedCategory);
      });
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostUrl = (post: BlogPost) => {
    const slug = language === 'pt' ? post.slug_pt : post.slug_en;
    return `/blog/${slug}`;
  };

  const getTitle = (post: BlogPost) => {
    return language === 'pt' ? post.title_pt : post.title_en;
  };

  const getExcerpt = (post: BlogPost) => {
    const excerpt = language === 'pt' ? post.excerpt_pt : post.excerpt_en;
    if (excerpt) return excerpt;
    
    const content = language === 'pt' ? post.content_pt : post.content_en;
    return content.substring(0, 150) + '...';
  };

  const getCategory = (post: BlogPost) => {
    return language === 'pt' ? post.category_pt : post.category_en;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">{t('blog.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-sora font-bold text-4xl md:text-6xl mb-8 animate-fade-in-up">
            <span className="text-gradient">{t('nav.blog')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="glass-card max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center text-muted-foreground">
                <Filter className="w-4 h-4 mr-2" />
                <span>{filteredPosts.length} posts encontrados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="glass-card text-center max-w-md mx-auto">
              <p className="text-muted-foreground">
                {t('blog.no_posts')}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="blog-card group">
                  {/* Cover Image */}
                  {post.cover_image && (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-4 overflow-hidden">
                      <img 
                        src={post.cover_image} 
                        alt={getTitle(post)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Category */}
                  <div className="text-sm font-semibold text-primary mb-2">
                    {getCategory(post)}
                  </div>

                  {/* Title */}
                  <h3 className="font-sora font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                    {getTitle(post)}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {getExcerpt(post)}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.publish_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.views} visualizações</span>
                      </div>
                    </div>
                  </div>

                  {/* Read More */}
                  <Link 
                    to={getPostUrl(post)}
                    className="flex items-center space-x-2 text-primary font-semibold group-hover:translate-x-2 transition-transform"
                  >
                    <span>{t('blog.read_more')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;