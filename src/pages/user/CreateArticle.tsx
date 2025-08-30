import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Plus } from 'lucide-react';

export default function CreateArticle() {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    coverImage: '',
    categoryTags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.title || !formData.shortDescription || !formData.fullDescription || !formData.coverImage) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.createArticle(formData, token);
      if (response.success) {
        toast({
          title: 'Article created',
          description: 'Your article has been submitted for review.',
        });
        navigate('/my-articles');
      }
    } catch (error: any) {
      toast({
        title: 'Error creating article',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.categoryTags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        categoryTags: [...prev.categoryTags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categoryTags: prev.categoryTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Article</h1>
          <p className="text-muted-foreground">
            Share your thoughts and ideas with the world
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter an engaging title for your article"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL *</Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {formData.coverImage && (
                  <div className="mt-2">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  placeholder="Write a brief description that will appear in article previews"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.shortDescription.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Article Content *</Label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  placeholder="Write your full article content here..."
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  rows={12}
                  className="min-h-[300px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Category Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim() || isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.categoryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categoryTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="hero"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Article'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}