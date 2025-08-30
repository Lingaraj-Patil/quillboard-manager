import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  pendingArticles: number;
  publishedArticles: number;
  rejectedArticles: number;
  totalUsers: number;
}

interface RecentArticle {
  _id: string;
  title: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
  author: {
    username: string;
  };
}

interface RecentUser {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AdminDashboardData {
  admin: {
    id: string;
    username: string;
    email: string;
  };
  stats: DashboardStats;
  recentArticles: RecentArticle[];
  recentUsers: RecentUser[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getAdminDashboard(token);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Welcome back, {dashboardData.admin.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening on your platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              All articles on platform
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
              Need your attention
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
              Rejected articles
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {dashboardData.stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered writers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild variant="hero" className="h-auto p-4">
          <Link to="/admin/pending" className="flex flex-col items-center space-y-2">
            <Clock className="h-6 w-6" />
            <span>Review Pending</span>
            <span className="text-xs opacity-80">{dashboardData.stats.pendingArticles} waiting</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/admin/articles" className="flex flex-col items-center space-y-2">
            <FileText className="h-6 w-6" />
            <span>Manage Articles</span>
            <span className="text-xs opacity-80">{dashboardData.stats.totalArticles} total</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/admin/users" className="flex flex-col items-center space-y-2">
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
            <span className="text-xs opacity-80">{dashboardData.stats.totalUsers} users</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/admin/analytics" className="flex flex-col items-center space-y-2">
            <TrendingUp className="h-6 w-6" />
            <span>View Analytics</span>
            <span className="text-xs opacity-80">Platform insights</span>
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Articles</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/articles">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentArticles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent articles</p>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentArticles.slice(0, 5).map((article) => (
                  <div
                    key={article._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        by {article.author.username} • {formatDate(article.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Badge className={`${getStatusColor(article.status)} text-xs`}>
                        {article.status}
                      </Badge>
                      {article.status === 'published' && (
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/article/${article._id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/users">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent users</p>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{user.username}</h4>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
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