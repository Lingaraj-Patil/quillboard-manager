import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Trash2,
  Calendar,
  User
} from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  categoryTags: string[];
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
  publishedDate?: string;
  author: {
    username: string;
    email: string;
  };
}

export default function AdminArticles() {
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
      const response = await apiClient.getAllArticlesAdmin(token, { limit: 50 });
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
        article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    setFilteredArticles(filtered);
  };

  const handleApproveArticle = async (articleId: string) => {
    if (!token) return;

    try {
      await apiClient.approveArticle(articleId, token);
      toast({
        title: 'Article approved',
        description: 'The article has been published successfully.',
      });
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Error approving article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectArticle = async (articleId: string) => {
    if (!token) return;

    const reason = prompt('Enter a reason for rejection (optional):');
    
    try {
      await apiClient.rejectArticle(articleId, token, reason || undefined);
      toast({
        title: 'Article rejected',
        description: 'The article has been rejected.',
      });
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Error rejecting article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublishArticle = async (articleId: string) => {
    if (!token || !confirm('Are you sure you want to unpublish this article?')) return;

    const reason = prompt('Enter a reason for unpublishing (optional):');
    
    try {
      await apiClient.unpublishArticle(articleId, token, reason || undefined);
      toast({
        title: 'Article unpublished',
        description: 'The article has been unpublished.',
      });
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Error unpublishing article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!token || !confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    try {
      await apiClient.deleteArticleAdmin(articleId, token);
      toast({
        title: 'Article deleted',
        description: 'The article has been permanently deleted.',
      });
      fetchArticles();
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Article Management</h1>
        <p className="text-muted-foreground">
          Review, approve, and manage all articles on the platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles or authors..."
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
      <div className="grid gap-6">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No articles found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article._id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Article Image */}
                  <div className="lg:w-48 lg:h-32 w-full h-48 flex-shrink-0">
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {article.author.username}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created {formatDate(article.createdAt)}
                        </div>
                        {article.status === 'published' && article.publishedDate && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Published {formatDate(article.publishedDate)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.status === 'published' && (
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/article/${article._id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                        
                        {article.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveArticle(article._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectArticle(article._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {article.status === 'published' && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleUnpublishArticle(article._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Unpublish
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
          ))
        )}
      </div>
    </div>
  );
}