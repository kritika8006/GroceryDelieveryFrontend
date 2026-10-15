import { useState, useEffect } from "react";
import { StarIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Product, Review } from "../types";

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5">
        <StarIcon className={`size-6 ${s <= value ? "text-app-gold fill-app-gold" : "text-app-border"}`} />
      </button>
    ))}
  </div>
);

export default function ReviewsSection({ product }: { product: Product }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(false);

  const myReview = user ? reviews.find((r) => (typeof r.user === "object" ? r.user._id : r.user) === user._id) : undefined;

  useEffect(() => {
    api
      .getReviews(product._id)
      .then((data: Review[]) => {
        setReviews(data);
        const mine = user ? data.find((r) => (typeof r.user === "object" ? r.user._id : r.user) === user._id) : undefined;
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));

    // Someone who already has a review clearly qualified before — always let them
    // keep editing/deleting it even if, say, the order later got cancelled by support.
    if (user) {
      api.canReview(product._id).then(({ canReview }: { canReview: boolean }) => setEligible(canReview)).catch(() => setEligible(false));
    }
  }, [product._id, user]);

  const submitReview = async () => {
    if (myRating === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    setSubmitting(true);
    try {
      const saved: Review = await api.submitReview(product._id, { rating: myRating, comment: myComment });
      setReviews((prev) => {
        const withoutMine = prev.filter((r) => r._id !== saved._id);
        return [saved, ...withoutMine];
      });
      toast.success(myReview ? "Review updated" : "Review submitted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const removeMyReview = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.deleteReview(product._id);
      setReviews((prev) => prev.filter((r) => r._id !== myReview?._id));
      setMyRating(0);
      setMyComment("");
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete review");
    }
  };

  const breakdown = [0, 0, 0, 0, 0]; // index 0 = 5 stars ... index 4 = 1 star
  reviews.forEach((r) => breakdown[5 - r.rating]++);
  const maxCount = Math.max(...breakdown, 1);

  // Computed from the reviews we actually have, not product.rating — that prop was
  // fetched once when the page loaded and goes stale the moment a review is
  // added/edited/deleted here, with no way for this component to refetch its parent.
  const liveAverage = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : product.rating;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-app-green mb-6">Customer Reviews</h2>

      <div className="bg-white/50 rounded-2xl p-6 md:p-8">
        {/* Summary row */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-app-border">
          <div className="flex flex-col items-center md:min-w-[160px] lg:w-1/3">
            <span className="text-5xl font-semibold text-app-green">{liveAverage || 0}</span>
            <div className="flex items-center gap-0.5 mt-2 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} className={`size-4 ${s <= Math.round(liveAverage) ? "text-app-gold fill-app-gold" : "text-app-border"}`} />
              ))}
            </div>
            <span className="text-sm text-app-text-light">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
          </div>

          <div className="flex-1 space-y-2">
            {breakdown.map((count, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-app-text-light w-8 text-right">{5 - i} ★</span>
                <div className="flex-1 h-2.5 bg-app-border rounded-full overflow-hidden">
                  <div className="h-full bg-app-gold rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="text-xs text-app-text-light w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave / edit a review */}
        {!user ? (
          <p className="text-sm text-app-text-light mb-8 pb-8 border-b border-app-border">
            Log in to leave a review.
          </p>
        ) : !eligible && !myReview ? (
          <p className="text-sm text-app-text-light mb-8 pb-8 border-b border-app-border">
            You can review this product once an order containing it has been delivered to you.
          </p>
        ) : (
          <div className="mb-8 pb-8 border-b border-app-border">
            <p className="text-sm font-medium text-app-green mb-3">{myReview ? "Your review" : "Leave a review"}</p>
            <StarPicker value={myRating} onChange={setMyRating} />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think of this product?"
              maxLength={1000}
              className="w-full mt-3 p-3 bg-white border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors text-sm"
              rows={3}
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={submitReview}
                disabled={submitting}
                className="px-5 py-2 bg-app-green text-white text-sm font-medium rounded-full hover:bg-app-clay transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
              </button>
              {myReview && (
                <button onClick={removeMyReview} className="flex items-center gap-1 text-sm text-app-clay hover:text-app-clay-dark transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Individual reviews */}
        {loading ? (
          <p className="text-sm text-app-text-light">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-app-text-light">No reviews yet — be the first.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const reviewer = typeof review.user === "object" ? review.user : null;
              return (
                <div key={review._id} className="flex gap-4">
                  <div className="size-10 rounded-full bg-app-green/10 text-app-green flex items-center justify-center shrink-0 text-sm font-semibold">
                    {reviewer?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-sm font-semibold text-app-green">{reviewer?.name || "Anonymous"}</span>
                      <span className="text-xs text-app-text-light">·</span>
                      <span className="text-xs text-app-text-light">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} className={`size-3.5 ${s <= review.rating ? "text-app-gold fill-app-gold" : "text-app-border"}`} />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-app-text-light leading-relaxed">{review.comment}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}