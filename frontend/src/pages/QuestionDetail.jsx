import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function QuestionDetail() {
  const { questionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [answerImages, setAnswerImages] = useState([]);
  const [answerImagePreviews, setAnswerImagePreviews] = useState([]);
  const [replyContent, setReplyContent] = useState({});
  const [replyImages, setReplyImages] = useState({});
  const [replyImagePreviews, setReplyImagePreviews] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [userAnswerVotes, setUserAnswerVotes] = useState({});
  const [selectedPollOption, setSelectedPollOption] = useState(null);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [questionId]);

  const fetchQuestionAndAnswers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/forum/questions/${questionId}`);
      setQuestion(res.data.question);
      setAnswers(res.data.answers);

      // Check user's vote on question
      if (user) {
        if (res.data.question.upvotes?.includes(user._id)) {
          setUserVote("upvote");
        } else if (res.data.question.downvotes?.includes(user._id)) {
          setUserVote("downvote");
        }

        // Check user's votes on answers
        const votes = {};
        res.data.answers.forEach((answer) => {
          if (answer.upvotes?.includes(user._id)) {
            votes[answer._id] = "upvote";
          } else if (answer.downvotes?.includes(user._id)) {
            votes[answer._id] = "downvote";
          }
        });
        setUserAnswerVotes(votes);

        // Check if user already voted in poll
        if (res.data.question.isPoll) {
          res.data.question.pollOptions?.forEach((option, idx) => {
            if (option.votes?.some((vote) => vote.user === user._id)) {
              setSelectedPollOption(idx);
            }
          });
        }
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      toast.error("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/forum/questions/${questionId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestion({
        ...question,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes,
      });

      if (userVote === voteType) {
        setUserVote(null);
      } else {
        setUserVote(voteType);
      }

      toast.success("Vote recorded!");
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to vote");
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/forum/answers/${answerId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnswers(
        answers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                upvotes: res.data.upvotes,
                downvotes: res.data.downvotes,
              }
            : answer
        )
      );

      if (userAnswerVotes[answerId] === voteType) {
        setUserAnswerVotes({ ...userAnswerVotes, [answerId]: null });
      } else {
        setUserAnswerVotes({ ...userAnswerVotes, [answerId]: voteType });
      }

      toast.success("Vote recorded!");
    } catch (err) {
      console.error("Error voting answer:", err);
      toast.error("Failed to vote");
    }
  };

  const handlePollVote = async (optionIndex) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    if (selectedPollOption !== null) {
      toast.error("You have already voted");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/forum/questions/${questionId}/poll/vote`,
        { optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestion({
        ...question,
        pollOptions: res.data.pollOptions,
      });
      setSelectedPollOption(optionIndex);
      toast.success("Vote recorded!");
    } catch (err) {
      console.error("Error voting poll:", err);
      toast.error(err.response?.data?.message || "Failed to vote");
    }
  };

  const handleAnswerImageSelect = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    if (answerImages.length + validFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setAnswerImages([...answerImages, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswerImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAnswerImage = (index) => {
    setAnswerImages(answerImages.filter((_, i) => i !== index));
    setAnswerImagePreviews(answerImagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!answerContent.trim()) {
      toast.error("Answer content is required");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("content", answerContent.trim());

      answerImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await API.post(
        `/forum/questions/${questionId}/answers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnswers([res.data.answer, ...answers]);
      setAnswerContent("");
      setAnswerImages([]);
      setAnswerImagePreviews([]);
      toast.success("Answer posted! 🎉");
    } catch (err) {
      console.error("Error posting answer:", err);
      toast.error(err.response?.data?.message || "Failed to post answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyImageSelect = (answerId, e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    const currentImages = replyImages[answerId] || [];
    if (currentImages.length + validFiles.length > 3) {
      toast.error("Maximum 3 images allowed per reply");
      return;
    }

    setReplyImages({
      ...replyImages,
      [answerId]: [...currentImages, ...validFiles],
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImagePreviews({
          ...replyImagePreviews,
          [answerId]: [...(replyImagePreviews[answerId] || []), reader.result],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReplyImage = (answerId, index) => {
    setReplyImages({
      ...replyImages,
      [answerId]: (replyImages[answerId] || []).filter((_, i) => i !== index),
    });
    setReplyImagePreviews({
      ...replyImagePreviews,
      [answerId]: (replyImagePreviews[answerId] || []).filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleSubmitReply = async (answerId) => {
    const content = replyContent[answerId];

    if (!content?.trim()) {
      toast.error("Reply content is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", content.trim());

      const images = replyImages[answerId] || [];
      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await API.post(
        `/forum/answers/${answerId}/replies`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnswers(
        answers.map((answer) =>
          answer._id === answerId
            ? { ...answer, replies: [...answer.replies, res.data.reply] }
            : answer
        )
      );

      setReplyContent({ ...replyContent, [answerId]: "" });
      setReplyImages({ ...replyImages, [answerId]: [] });
      setReplyImagePreviews({ ...replyImagePreviews, [answerId]: [] });
      toast.success("Reply posted!");
    } catch (err) {
      console.error("Error posting reply:", err);
      toast.error("Failed to post reply");
    }
  };

  const handleMarkBestAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/forum/answers/${answerId}/mark-best`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnswers(
        answers.map((answer) => ({
          ...answer,
          isBestAnswer: answer._id === answerId,
        }))
      );

      setQuestion({ ...question, isSolved: true });
      toast.success("Answer marked as best! ⭐");
    } catch (err) {
      console.error("Error marking best answer:", err);
      toast.error("Failed to mark as best answer");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (
      !window.confirm("⚠️ Delete this answer?\n\nThis action cannot be undone.")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/forum/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnswers(answers.filter((a) => a._id !== answerId));
      toast.success("Answer deleted!");
    } catch (err) {
      console.error("Error deleting answer:", err);
      toast.error("Failed to delete answer");
    }
  };

  const handleDeleteReply = async (answerId, replyId) => {
    if (!window.confirm("⚠️ Delete this reply?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/forum/answers/${answerId}/replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnswers(
        answers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                replies: answer.replies.filter((r) => r._id !== replyId),
              }
            : answer
        )
      );

      toast.success("Reply deleted!");
    } catch (err) {
      console.error("Error deleting reply:", err);
      toast.error("Failed to delete reply");
    }
  };

  const handleUpvoteReply = async (answerId, replyId) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/forum/answers/${answerId}/replies/${replyId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnswers(
        answers.map((answer) => {
          if (answer._id === answerId) {
            return {
              ...answer,
              replies: answer.replies.map((reply) =>
                reply._id === replyId
                  ? { ...reply, upvotes: res.data.upvotes }
                  : reply
              ),
            };
          }
          return answer;
        })
      );

      toast.success("Vote recorded!");
    } catch (err) {
      console.error("Error upvoting reply:", err);
      toast.error("Failed to vote");
    }
  };

  const getVoteScore = (upvotes = [], downvotes = []) => {
    return upvotes.length - downvotes.length;
  };

  const getTotalPollVotes = () => {
    if (!question?.pollOptions) return 0;
    return question.pollOptions.reduce(
      (sum, opt) => sum + (opt.votes?.length || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Question not found
          </h2>
          <a
            href="/forum"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Forum
          </a>
        </div>
      </div>
    );
  }

  const questionVoteScore = getVoteScore(question.upvotes, question.downvotes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 mb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a
          href="/forum"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all shadow-lg border-2 border-gray-200 mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Forum
        </a>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex gap-6">
            {/* Voting Section */}
            {/* <div className="hidden lg:block flex-shrink-0 text-center space-y-3">
              <button
                onClick={() => handleVoteQuestion("upvote")}
                className={`w-12 h-12 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                  userVote === "upvote"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>

              <div
                className={`text-xl font-black ${
                  questionVoteScore > 0
                    ? "text-green-600"
                    : questionVoteScore < 0
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {questionVoteScore > 0 ? "+" : ""}
                {questionVoteScore} Vote
              </div>

              <button
                onClick={() => handleVoteQuestion("downvote")}
                className={`w-12 h-12 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                  userVote === "downvote"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div> */}

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <h1 className="!text-2xl font-bold text-gray-900">
                  {question.title}
                </h1>
                <div className="flex gap-2 ml-4">
                  {question.isSolved && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">
                      ✅ Solved
                    </span>
                  )}
                  {question.isPoll && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200">
                      📊 Poll
                    </span>
                  )}

                  {question.isFlagged && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">
                      🚩 Flagged
                    </span>
                  )}
                </div>
              </div>

              {question.isFlagged && question.flagReason && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-900 mb-1">
                        ⚠️ This question has been flagged by moderators
                      </h3>
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Reason:</span>{" "}
                        {question.flagReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                {question.content}
              </p>

              {/* Images */}
              {question.images?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {question.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url}
                      alt={`Question image ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                  ))}
                </div>
              )}

              {/* Poll */}
              {question.isPoll && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    Poll ({getTotalPollVotes()} votes)
                  </h3>
                  <div className="space-y-3">
                    {question.pollOptions?.map((option, idx) => {
                      const totalVotes = getTotalPollVotes();
                      const percentage =
                        totalVotes > 0
                          ? (
                              ((option.votes?.length || 0) / totalVotes) *
                              100
                            ).toFixed(1)
                          : 0;
                      const isSelected = selectedPollOption === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => handlePollVote(idx)}
                          disabled={selectedPollOption !== null}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-700"
                              : selectedPollOption !== null
                              ? "bg-white border-purple-200 cursor-not-allowed"
                              : "bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {option.option}
                            </span>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                          {selectedPollOption !== null && (
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  isSelected ? "bg-white" : "bg-purple-600"
                                } transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories & Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.categories?.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold border border-blue-200"
                  >
                    {cat}
                  </span>
                ))}
                {question.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author & Meta */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <a
                  href={`/profile/${question.author?.username}`}
                  className="flex items-center gap-3"
                >
                  {question.author?.avatar ? (
                    <img
                      src={question.author.avatar}
                      alt={question.author.username}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {question.author?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {question.author?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {question.author?.designation || question.author?.role} •
                      Reputation: {question.author?.reputation || 0}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {question.views} views
                  </span>
                  <span>{new Date(question.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="text-center  flex items-center  gap-6 mt-6">
            <button
              onClick={() => handleVoteQuestion("upvote")}
              className={`w-8 h-8 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                userVote === "upvote"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100  hover:bg-green-100 hover:text-green-600"
              }`}
            >
              <svg
                className="!bg-gray-900 w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m5.84 17.41l5.66-5.66l5.66 5.66l-.71.7l-4.95-4.95l-4.95 4.95l-.71-.7m0-4l5.66-5.66l5.66 5.66l-.71.7l-4.95-4.95l-4.95 4.95l-.71-.7Z"
                />
              </svg>
            </button>

            <div
              className={`text-xl font-black ${
                questionVoteScore > 0
                  ? "text-green-600"
                  : questionVoteScore < 0
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {questionVoteScore > 0 ? "+" : ""}
              {questionVoteScore} Vote
            </div>

            <button
              onClick={() => handleVoteQuestion("downvote")}
              className={`w-8 h-8 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                userVote === "downvote"
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h2>

          {/* Answer Form */}
          {user && (
            <form
              onSubmit={handleSubmitAnswer}
              className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200"
            >
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                Your Answer
              </label>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none mb-3"
                rows="6"
                required
              />

              {/* Answer Images */}
              <div className="mb-3">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAnswerImageSelect}
                  className="hidden"
                  id="answer-image-upload"
                />
                <label
                  htmlFor="answer-image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-200 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Add Images (Max 5)
                </label>
              </div>

              {answerImagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {answerImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeAnswerImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "Post Answer 🚀"}
              </button>
            </form>
          )}

          {/* Answers List */}
          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <span className="text-5xl">💭</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No answers yet
                </h3>
                <p className="text-gray-600">
                  Be the first to answer this question!
                </p>
              </div>
            ) : (
              answers.map((answer) => {
                const answerVoteScore = getVoteScore(
                  answer.upvotes,
                  answer.downvotes
                );
                const canMarkBest =
                  user &&
                  (user._id === question.author?._id ||
                    user.role === "teacher");
                const canDelete = user && user._id === answer.author?._id;

                return (
                  <div
                    key={answer._id}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      answer.isBestAnswer
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
                          {answer.content}
                        </p>

                        {/* Answer Images */}
                        {answer.images?.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                            {answer.images.map((image, idx) => (
                              <img
                                key={idx}
                                src={image.url}
                                alt={`Answer image ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(image.url, "_blank")}
                              />
                            ))}
                          </div>
                        )}

                        {/* Answer Actions */}
                        <div className="flex items-center gap-2 mb-3">
                          {canMarkBest && !answer.isBestAnswer && (
                            <button
                              onClick={() => handleMarkBestAnswer(answer._id)}
                              className="!px-3 !py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg sm:!text-xs font-semibold transition-all"
                            >
                              ⭐ Mark as Best
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="!px-3 !py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg sm:!text-xs font-semibold transition-all"
                            >
                              🗑️ Delete
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setShowReplies({
                                ...showReplies,
                                [answer._id]: !showReplies[answer._id],
                              })
                            }
                            className="!px-3 !py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm sm:!text-xs font-semibold transition-all"
                          >
                            💬 {showReplies[answer._id] ? "Hide" : "Show"}{" "}
                            Replies ({answer.replies?.length || 0})
                          </button>
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <a
                            href={`/user/${answer.author?._id}`}
                            className="flex items-center gap-2"
                          >
                            {answer.author?.avatar ? (
                              <img
                                src={answer.author.avatar}
                                alt={answer.author.username}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {answer.author?.username
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {answer.author?.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {answer.author?.designation ||
                                  answer.author?.role}{" "}
                                • Reputation: {answer.author?.reputation || 0}
                              </p>
                            </div>
                          </a>
                          <span className="text-xs text-gray-500">
                            {new Date(answer.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Vote Section */}
                        <div className="text-center  flex items-center  gap-6 mt-6">
                          <button
                            onClick={() =>
                              handleVoteAnswer(answer._id, "upvote")
                            }
                            className={`w-8 h-8 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                              userAnswerVotes[answer._id] === "upvote"
                                ? "bg-green-600 text-white shadow-lg"
                                : "bg-white text-gray-600 hover:bg-green-100 hover:text-green-600 border border-gray-200"
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>

                          <div
                            className={`text-xl font-black ${
                              answerVoteScore > 0
                                ? "text-green-600"
                                : answerVoteScore < 0
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {answerVoteScore > 0 ? "+" : ""}
                            {answerVoteScore}
                          </div>

                          <button
                            onClick={() =>
                              handleVoteAnswer(answer._id, "downvote")
                            }
                            className={`w-8 h-8 rounded-xl !border-2 !border-gray-200 flex items-center justify-center transition-all ${
                              userAnswerVotes[answer._id] === "downvote"
                                ? "bg-red-600 text-white shadow-lg"
                                : "bg-white text-gray-600 hover:bg-red-100 hover:text-red-600 border border-gray-200"
                            }`}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>

                          {answer.isBestAnswer && (
                            <div className="mt-3">
                              <span className="inline-block px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">
                                ⭐ Best
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Replies Section */}
                        {showReplies[answer._id] && (
                          <div className="mt-4 pl-4 border-l-4 border-blue-200 space-y-3">
                            {/* Reply Form */}
                            {user && (
                              <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <textarea
                                  value={replyContent[answer._id] || ""}
                                  onChange={(e) =>
                                    setReplyContent({
                                      ...replyContent,
                                      [answer._id]: e.target.value,
                                    })
                                  }
                                  placeholder="Write a reply..."
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm"
                                  rows="3"
                                />

                                {/* Reply Images */}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleReplyImageSelect(answer._id, e)
                                    }
                                    className="hidden"
                                    id={`reply-image-${answer._id}`}
                                  />
                                  <label
                                    htmlFor={`reply-image-${answer._id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Add Images
                                  </label>
                                </div>

                                {replyImagePreviews[answer._id]?.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {replyImagePreviews[answer._id].map(
                                      (preview, idx) => (
                                        <div
                                          key={idx}
                                          className="relative group"
                                        >
                                          <img
                                            src={preview}
                                            alt={`Reply preview ${idx + 1}`}
                                            className="w-full h-16 object-cover rounded-lg border border-gray-200"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeReplyImage(answer._id, idx)
                                            }
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleSubmitReply(answer._id)}
                                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm transition-all"
                                >
                                  Post Reply
                                </button>
                              </div>
                            )}

                            {/* Replies List */}
                            {answer.replies?.map((reply) => (
                              <div
                                key={reply._id}
                                className="p-3 bg-white rounded-xl border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {reply.author?.avatar ? (
                                      <img
                                        src={reply.author.avatar}
                                        alt={reply.author.username}
                                        className="w-8 h-8 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs">
                                        {reply.author?.username
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">
                                        {reply.author?.username}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {reply.author?.designation || "Student"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        handleUpvoteReply(answer._id, reply._id)
                                      }
                                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        reply.upvotes?.includes(user?._id)
                                          ? "bg-green-600 text-white"
                                          : "bg-gray-100 text-gray-600 hover:bg-green-100"
                                      }`}
                                    >
                                      👍 {reply.upvotes?.length || 0}
                                    </button>
                                    {user && user._id === reply.author?._id && (
                                      <button
                                        onClick={() =>
                                          handleDeleteReply(
                                            answer._id,
                                            reply._id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-700 p-1"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-2">
                                  {reply.content}
                                </p>

                                {/* Reply Images */}
                                {reply.images?.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mb-2">
                                    {reply.images.map((image, idx) => (
                                      <img
                                        key={idx}
                                        src={image.url}
                                        alt={`Reply image ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() =>
                                          window.open(image.url, "_blank")
                                        }
                                      />
                                    ))}
                                  </div>
                                )}

                                <p className="text-xs text-gray-400">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
