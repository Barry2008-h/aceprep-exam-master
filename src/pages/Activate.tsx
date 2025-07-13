
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Key, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Activate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [activationKey, setActivationKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    try {
      // Check if key exists and is unused
      const { data: keyData, error: keyError } = await supabase
        .from('activation_keys')
        .select('*')
        .eq('key_code', activationKey)
        .eq('is_used', false)
        .single();

      if (keyError || !keyData) {
        toast({
          title: "Invalid activation key",
          description: "Please check your key and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Mark key as used
      const { error: updateKeyError } = await supabase
        .from('activation_keys')
        .update({ 
          is_used: true, 
          used_by: user.id, 
          used_at: new Date().toISOString() 
        })
        .eq('id', keyData.id);

      if (updateKeyError) {
        throw updateKeyError;
      }

      // Update user profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ 
          is_activated: true, 
          activation_key: activationKey 
        })
        .eq('id', user.id);

      if (updateProfileError) {
        throw updateProfileError;
      }

      toast({
        title: "Activation successful!",
        description: "All features are now unlocked and ads have been removed.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-4 mx-auto">
              <Key className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Activate Your App</CardTitle>
            <p className="text-gray-600">Enter your activation key to unlock all features</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivation} className="space-y-6">
              <div>
                <Label htmlFor="activationKey">Activation Key</Label>
                <Input
                  id="activationKey"
                  type="text"
                  placeholder="Enter your activation key"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  required
                  className="text-center font-mono"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Access to all Past Questions</li>
                  <li>• Unlimited Exam Mode</li>
                  <li>• Complete Past Scores history</li>
                  <li>• Ad-free experience</li>
                  <li>• Premium course content</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Activating...' : 'Activate App'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need an activation key? Contact your administrator or purchase one from our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activate;
