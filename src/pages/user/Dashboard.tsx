import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { 
  PenTool, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  rejectedArticles: number;
}

interface RecentArticle {
  _id: string;
  title: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
}

interface DashboardData {
  user: {
    id: string;
    username: string;
    email: string;
  };
  stats: DashboardStats;
  recentArticles: RecentArticle[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getUserDashboard(token);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome back, {dashboardData.user.username}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your writing activity
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/create-article">
                <Plus className="mr-2 h-5 w-5" />
                Write New Article
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/my-articles">
                <FileText className="mr-2 h-5 w-5" />
                Manage Articles
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {dashboardData.stats.totalArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                All time articles written
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {dashboardData.stats.publishedArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                Live articles
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {dashboardData.stats.pendingArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {dashboardData.stats.rejectedArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                Need revision
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Articles</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/my-articles">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentArticles.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No articles yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start writing your first article to see it here
                </p>
                <Button asChild variant="hero">
                  <Link to="/create-article">Create Article</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentArticles.map((article) => (
                  <div
                    key={article._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-primary mb-1">
                        {article.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(article.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(article.status)}>
                        {getStatusIcon(article.status)}
                        <span className="ml-1 capitalize">{article.status}</span>
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/my-articles/${article._id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}