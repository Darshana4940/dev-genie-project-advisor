
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  StarHalf, 
  MessageCircle, 
  User,
  Send,
  Clock
} from 'lucide-react';
import { ProjectReview, ProjectSuggestion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ProjectReviewDialogProps {
  project: ProjectSuggestion;
  onReviewAdded?: (review: ProjectReview) => void;
}

const ProjectReviewDialog: React.FC<ProjectReviewDialogProps> = ({ 
  project,
  onReviewAdded 
}) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<ProjectReview[]>(project.reviews || []);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Create a new review
    const newReview: ProjectReview = {
      id: `review-${Date.now()}`,
      userId: user.id,
      username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString()
    };

    // In a real app, this would be saved to a database
    // For now, just update the local state
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    
    // Reset form
    setRating(0);
    setComment('');
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
    
    setIsSubmitting(false);
    
    // Notify parent component
    if (onReviewAdded) {
      onReviewAdded(newReview);
    }
  };

  const StarRating = ({ value, onChange }: { value: number, onChange?: (value: number) => void }) => {
    const handleClick = (index: number) => {
      if (onChange) {
        onChange(index);
      }
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            className={`p-1 ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!onChange}
          >
            {index <= value ? (
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>Reviews</span>
          {reviews.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
              {reviews.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Reviews</DialogTitle>
          <DialogDescription>
            See what others think about this project or leave your own review.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Average Rating</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating value={Math.round(averageRating)} />
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {user && (
              <Button 
                variant="default"
                size="sm"
                onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Write a Review
              </Button>
            )}
          </div>
          
          <Separator />
          
          {/* Reviews list */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reviews</h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{review.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{review.username}</h4>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(review.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <StarRating value={review.rating} />
                    </div>
                    
                    {review.comment && (
                      <p className="mt-3 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No reviews yet. Be the first to review this project!
              </p>
            )}
          </div>
          
          <Separator />
          
          {/* Review form */}
          {user ? (
            <div id="review-form" className="space-y-4">
              <h3 className="text-lg font-medium">Write a Review</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Rating</label>
                <StarRating value={rating} onChange={handleRatingChange} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Comments (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this project..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSubmitReview} 
                disabled={isSubmitting || rating === 0}
                className="w-full"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">
                Please log in to leave a review.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectReviewDialog;
