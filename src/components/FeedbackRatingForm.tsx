/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, Award, Smile, ThumbsUp, Heart, Sparkles } from 'lucide-react';

interface FeedbackRatingFormProps {
  bookingId: string;
  proName: string;
  onFeedbackSubmit: (review: {
    rating: number;
    text: string;
    tags: string[];
    author: string;
  }) => void;
}

const SATISFACTION_TAGS = [
  'Prompt Arrival ⚡',
  'Polite & Respectful 🤝',
  'Flawless Cleanup 🧹',
  'High Expertise ⚙️',
  'Accurate Estimate 💰',
  'Clear Communication 💬',
];

export default function FeedbackRatingForm({
  bookingId,
  proName,
  onFeedbackSubmit
}: FeedbackRatingFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    // Submit payload
    onFeedbackSubmit({
      rating,
      text: reviewText.trim() || `Professional work completed by ${proName.split(' ')[0]}. Highly recommended service!`,
      tags: selectedTags,
      author: authorName.trim() || 'Verified Nestly Client'
    });

    setIsSubmitted(true);
  };

  return (
    <div className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-6 md:p-8 rounded-none">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="feedback-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div>
              <span className="bg-[#6B9080]/20 text-[#1C2B24] text-[9px] uppercase tracking-[0.2em] font-sans font-bold px-2.5 py-1 inline-block mb-3">
                SERVICE SATISFACTION SURVEY
              </span>
              <h3 className="font-serif text-2xl font-black text-ink tracking-tight">
                Rate your service with {proName.split(' ')[0]}
              </h3>
              <p className="font-sans text-xs text-on-surface-variant/80 mt-1">
                Your direct, honest feedback helps us maintain premium Nestly standards. Tell us how the job went.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2">
                  1. Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-2xl cursor-pointer hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating ?? rating)
                            ? 'text-[#F4A261] fill-[#F4A261]'
                            : 'text-[#FAF9F6] fill-[#E8E6E1] stroke-[#1A1A1A]/15'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-sans text-xs text-on-surface-variant ml-3 italic">
                    {rating === 5 && 'Excellent Work'}
                    {rating === 4 && 'Good Service'}
                    {rating === 3 && 'Average'}
                    {rating === 2 && 'Needs Improvement'}
                    {rating === 1 && 'Poor Service'}
                  </span>
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2">
                  2. What did they do best? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SATISFACTION_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-2 text-[10px] uppercase tracking-wider font-sans font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C2B24] border-[#1C2B24] text-white'
                            : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant hover:border-[#1A1A1A]/30'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-1.5">
                  3. Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. David K."
                  className="w-full px-3 py-3 bg-white border border-[#1A1A1A]/15 text-xs font-sans rounded-none focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>

              {/* Detailed comment text field */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-1.5">
                  4. Written Feedback (Highly Valued)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Share your experience working with ${proName.split(' ')[0]}... Did they resolve your issues?`}
                  className="w-full px-3 py-2.5 bg-white border border-[#1A1A1A]/15 text-xs font-sans rounded-none focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#1C2B24] text-white hover:bg-opacity-95 font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Submit Professional Review</span>
                <Sparkles className="w-4 h-4 text-[#F4A261] group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="feedback-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="w-16 h-16 bg-[#F6FFF8] border border-[#6B9080]/30 rounded-none flex items-center justify-center mx-auto text-[#6B9080]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-black text-[#1C2B24]">
                Review Submitted Successfully!
              </h3>
              <p className="font-sans text-xs text-on-surface-variant/80 max-w-sm mx-auto leading-relaxed">
                Thank you. Your feedback has been logged under Booking ID <span className="font-mono bg-[#E8E6E1]/50 px-1.5 py-0.5 rounded-none">{bookingId}</span>. We've updated {proName.split(' ')[0]}'s scorecard in real-time.
              </p>
            </div>
            <div className="inline-flex gap-2 text-[10px] uppercase tracking-wider font-sans font-bold text-on-surface-variant/70 border border-[#1A1A1A]/10 bg-white px-4 py-2 mt-4 rounded-none">
              <Smile className="w-4 h-4 text-[#F4A261]" />
              <span>Double Verified Nestly Testimonial</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
