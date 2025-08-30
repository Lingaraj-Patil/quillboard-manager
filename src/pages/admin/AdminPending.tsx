import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  Clock
} from 'lucide-react';

interface PendingArticle {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  categoryTags: string[];
  createdAt: string;
  author: {
    username: string;
    email: string;
  };
}

export default function AdminPending() {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  const fetchPendingArticles = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getPendingArticles(token, { limit: 50 });
      if (response.success) {
        setArticles(response.data.articles);
      }
    } catch (error) {
      console.error('Error fetching pending articles:', error);
      toast({
        title: 'Error loading pending articles',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveArticle = async (articleId: string) => {
    if (!token) return;

    try {
      await apiClient.approveArticle(articleId, token);
      toast({
        title: 'Article approved',
        description: 'The article has been published successfully.',
      });
      fetchPendingArticles(); // Refresh the list
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
      fetchPendingArticles(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error rejecting article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
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
          <p className="text-muted-foreground">Loading pending articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Pending Articles</h1>
        <p className="text-muted-foreground">
          Review and approve articles waiting for publication
        </p>
      </div>

      {/* Stats */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-warning">
                  {articles.length}
                </h3>
                <p className="text-muted-foreground">
                  Articles awaiting review
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/articles">View All Articles</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Articles List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No pending articles
            </h3>
            <p className="text-muted-foreground">
              All articles have been reviewed. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
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
                        <p className="text-muted-foreground mb-3 line-clamp-3">
                          {article.shortDescription}
                        </p>
                      </div>
                      <Badge className="ml-4 bg-warning text-warning-foreground">
                        Pending Review
                      </Badge>
                    </div>

                    {/* Tags */}
                    {article.categoryTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.categoryTags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.categoryTags.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.categoryTags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta Info and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {article.author.username}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted {formatDate(article.createdAt)}
                        </div>
                      </div>

                      {/* Review Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveArticle(article._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve & Publish
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectArticle(article._id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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
  );
}