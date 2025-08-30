import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Search, 
  Plus, 
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  categoryTags: string[];
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
}

export default function MyArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter]);

  const fetchArticles = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getUserArticles(token, { limit: 50 });
      if (response.success) {
        setArticles(response.data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error loading articles',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    setFilteredArticles(filtered);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!token || !confirm('Are you sure you want to delete this article?')) return;

    try {
      await apiClient.deleteArticle(articleId, token);
      toast({
        title: 'Article deleted',
        description: 'Your article has been deleted successfully.',
      });
      fetchArticles(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error deleting article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
            <p className="text-muted-foreground">Loading your articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">My Articles</h1>
            <p className="text-muted-foreground">
              Manage and track your published content
            </p>
          </div>
          <Button asChild variant="hero" className="mt-4 sm:mt-0">
            <Link to="/create-article">
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <PenTool className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {articles.length === 0 ? 'No articles yet' : 'No matching articles'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {articles.length === 0 
                  ? 'Start writing your first article to see it here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {articles.length === 0 && (
                <Button asChild variant="hero">
                  <Link to="/create-article">Create Your First Article</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <Card key={article._id} className="hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Article Image */}
                    <div className="md:w-48 md:h-32 w-full h-48 flex-shrink-0">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {article.shortDescription}
                          </p>
                        </div>
                        <Badge className={`ml-4 ${getStatusColor(article.status)}`}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {article.categoryTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.categoryTags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.categoryTags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.categoryTags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created {formatDate(article.createdAt)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {article.status === 'published' && (
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/article/${article._id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                          {article.status !== 'published' && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteArticle(article._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}