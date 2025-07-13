
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Key, BookOpen, Target, Plus, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [activationKeys, setActivationKeys] = useState([]);
  const [newKeyCount, setNewKeyCount] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.username !== 'adminbarry') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      loadData();
    }
  }, [profile, loading, navigate]);

  const loadData = async () => {
    // Load users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersData) setUsers(usersData);

    // Load activation keys
    const { data: keysData } = await supabase
      .from('activation_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (keysData) setActivationKeys(keysData);
  };

  const generateActivationKeys = async () => {
    const newKeys = [];
    for (let i = 0; i < newKeyCount; i++) {
      const key = 'ACEPREP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      newKeys.push({
        key_code: key,
        created_by: profile?.id
      });
    }
    
    const { error } = await supabase
      .from('activation_keys')
      .insert(newKeys);

    if (error) {
      toast({
        title: "Error generating keys",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Keys generated successfully",
        description: `Generated ${newKeyCount} new activation key(s)`,
      });
      loadData();
    }
  };

  const initializeSampleData = async () => {
    // This will use the sample data already inserted via the migration
    toast({
      title: "Sample data initialized",
      description: "Sample subjects and question categories are ready",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!profile || profile.username !== 'adminbarry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You don't have permission to access the admin panel.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="keys">Activation Keys</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management ({users.length} users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-gray-500">No users registered yet</p>
                  ) : (
                    users.map((user: any) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p className="text-sm">{user.full_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Username</Label>
                            <p className="text-sm">{user.username}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <p className={`text-sm ${user.is_activated ? 'text-green-600' : 'text-gray-600'}`}>
                              {user.is_activated ? 'Activated' : 'Not Activated'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Activation Keys ({activationKeys.length} total)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    min="1"
                    max="100"
                    value={newKeyCount}
                    onChange={(e) => setNewKeyCount(parseInt(e.target.value) || 1)}
                    className="w-32"
                  />
                  <Button onClick={generateActivationKeys}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Keys
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Generated Keys</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                    {activationKeys.length === 0 ? (
                      <p className="text-gray-500">No activation keys generated yet</p>
                    ) : (
                      <div className="grid gap-2">
                        {activationKeys.map((key: any) => (
                          <div key={key.id} className={`font-mono text-sm p-2 rounded ${key.is_used ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'}`}>
                            {key.key_code} {key.is_used && '(Used)'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage courses, chapters, and practice questions</p>
                  <Button disabled>
                    Manage Courses (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Past Questions Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage past questions by category and year</p>
                  <Button disabled>
                    Manage Questions (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Initial Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Sample data has been initialized with subjects and question categories</p>
                  <Button onClick={initializeSampleData}>
                    Refresh Sample Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
