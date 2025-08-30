import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Layout/Navbar';
import { apiClient } from '@/lib/api';
import { Search, Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Article {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  categoryTags: string[];
  publishedDate: string;
  author: {
    username: string;
  };
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await apiClient.getAllArticles({ limit: 12 });
      if (response.success) {
        setArticles(response.data.articles);
        // Set first 3 as featured
        setFeaturedArticles(response.data.articles.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getAllArticles({ search: searchTerm });
      if (response.success) {
        setArticles(response.data.articles);
        setFeaturedArticles([]);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Best of the week
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
                <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </form>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/register">Start Writing</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-primary mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article, index) => (
                <Card key={article._id} className={`group cursor-pointer hover:shadow-medium transition-all duration-300 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <Link to={`/article/${article._id}`}>
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${index === 0 ? 'h-64 md:h-96' : 'h-48'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {article.categoryTags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className={`font-bold text-white mb-2 ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                          {article.title}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.shortDescription}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author.username}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(article.publishedDate)}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest Articles'}
            </h2>
            {searchTerm && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                fetchArticles();
              }}>
                Clear Search
              </Button>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {searchTerm ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to share your story!'}
              </p>
              {!searchTerm && !user && (
                <Button asChild className="mt-4" variant="hero">
                  <Link to="/register">Start Writing</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.slice(featuredArticles.length).map((article) => (
                <Card key={article._id} className="group cursor-pointer hover:shadow-medium transition-all duration-300">
                  <Link to={`/article/${article._id}`}>
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.categoryTags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-primary-hover transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.shortDescription}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author.username}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(article.publishedDate)}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}