import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  Award,
  Hash
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  stats: {
    articlesInPeriod: number;
    publishedInPeriod: number;
    usersInPeriod: number;
  };
  topAuthors: {
    _id: string;
    count: number;
    username: string;
    email: string;
  }[];
  popularCategories: {
    _id: string;
    count: number;
  }[];
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getAnalytics(token, selectedPeriod);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'year':
        return 'Last Year';
      default:
        return 'Last 30 Days';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and statistics for {getPeriodLabel(selectedPeriod).toLowerCase()}
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Period: {formatDate(analyticsData.startDate)} - {formatDate(analyticsData.endDate)}</span>
            <span>Data refreshed automatically</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analyticsData.stats.articlesInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles submitted in {getPeriodLabel(selectedPeriod).toLowerCase()}
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
              {analyticsData.stats.publishedInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles published in {getPeriodLabel(selectedPeriod).toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analyticsData.stats.usersInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Users joined in {getPeriodLabel(selectedPeriod).toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Authors */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Top Authors
              </CardTitle>
              <span className="text-sm text-muted-foreground">Published articles</span>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsData.topAuthors.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No published articles yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.topAuthors.map((author, index) => (
                  <div
                    key={author._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">{author.username}</h4>
                        <p className="text-xs text-muted-foreground">{author.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">{author.count}</div>
                      <div className="text-xs text-muted-foreground">articles</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Hash className="h-5 w-5 mr-2 text-primary" />
                Popular Categories
              </CardTitle>
              <span className="text-sm text-muted-foreground">Most used tags</span>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsData.popularCategories.length === 0 ? (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No categories used yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.popularCategories.map((category, index) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary capitalize">
                          {category._id}
                        </h4>
                        <p className="text-xs text-muted-foreground">Category tag</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{category.count}</div>
                      <div className="text-xs text-muted-foreground">uses</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {analyticsData.stats.articlesInPeriod > 0 
                  ? Math.round((analyticsData.stats.publishedInPeriod / analyticsData.stats.articlesInPeriod) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Articles approved vs submitted
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">
                {analyticsData.topAuthors.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Authors</p>
              <p className="text-xs text-muted-foreground mt-1">
                Authors with published content
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {analyticsData.popularCategories.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Categories</p>
              <p className="text-xs text-muted-foreground mt-1">
                Different topics covered
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}