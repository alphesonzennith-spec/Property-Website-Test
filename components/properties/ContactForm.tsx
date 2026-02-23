'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';

interface ContactFormProps {
  propertyId: string;
}

export function ContactForm({ propertyId }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);

    // You can add a success toast notification here
    alert('Message sent! The owner will contact you soon.');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-base">Contact Owner</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Your Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-9"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-9"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+65 1234 5678"
              value={formData.phone}
              onChange={handleChange}
              className="h-9"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-medium">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="I'm interested in viewing this property..."
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By submitting this form, you agree to be contacted regarding this property.
            Your information will not be shared with third parties.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
