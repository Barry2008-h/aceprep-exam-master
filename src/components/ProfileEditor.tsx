import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ProfileEditor = () => {
  const { toast } = useToast();
  const { profile, refetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    phone: profile?.phone || ''
  });

  const handleSave = async () => {
    if (!formData.full_name || !formData.username) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone
      })
      .eq('id', profile?.id);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved",
      });
      setIsEditing(false);
      refetchProfile();
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      phone: profile?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Profile
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email} disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label className="font-medium">Full Name</Label>
              <p className="text-sm">{profile?.full_name}</p>
            </div>
            <div>
              <Label className="font-medium">Username</Label>
              <p className="text-sm">{profile?.username}</p>
            </div>
            <div>
              <Label className="font-medium">Email</Label>
              <p className="text-sm">{profile?.email}</p>
            </div>
            {profile?.phone && (
              <div>
                <Label className="font-medium">Phone</Label>
                <p className="text-sm">{profile.phone}</p>
              </div>
            )}
            <div>
              <Label className="font-medium">Account Status</Label>
              <p className={`text-sm ${profile?.is_activated ? 'text-green-600' : 'text-orange-600'}`}>
                {profile?.is_activated ? 'Activated' : 'Not Activated'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;