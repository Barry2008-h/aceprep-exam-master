
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Key, ArrowLeft } from 'lucide-react';

const Activate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activationKey, setActivationKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Get valid activation keys from localStorage
    const validKeys = JSON.parse(localStorage.getItem('activationKeys') || '[]');
    const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');

    if (validKeys.includes(activationKey) && !usedKeys.includes(activationKey)) {
      // Mark key as used
      usedKeys.push(activationKey);
      localStorage.setItem('usedKeys', JSON.stringify(usedKeys));
      localStorage.setItem('userActivated', 'true');
      
      toast({
        title: "Activation successful!",
        description: "All features are now unlocked and ads have been removed.",
      });
      
      navigate('/');
    } else if (usedKeys.includes(activationKey)) {
      toast({
        title: "Key already used",
        description: "This activation key has already been used.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invalid activation key",
        description: "Please check your key and try again.",
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
