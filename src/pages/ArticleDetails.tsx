import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Layout/Navbar';
import { apiClient } from '@/lib/api';
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  categoryTags: string[];
  publishedDate: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
}

export default function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const response = await apiClient.getArticleById(articleId);
      if (response.success) {
        setArticle(response.data.article);
      }
    } catch (error: any) {
      setError(error.message || 'Article not found');
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
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">
              Article Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Button asChild variant="hero">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categoryTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            {article.title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            {article.shortDescription}
          </p>

          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span className="font-medium">{article.author.username}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(article.publishedDate)}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-medium"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {article.fullDescription}
          </div>
        </div>

        {/* Article Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">{article.author.username}</h4>
                <p className="text-sm text-muted-foreground">Article Author</p>
              </div>
            </div>
            
            <Button asChild variant="outline">
              <Link to="/">Read More Articles</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}