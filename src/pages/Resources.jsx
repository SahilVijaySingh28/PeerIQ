import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  BookOpen,
  Upload,
  X,
  Star,
  Share2,
  MessageCircle,
  Trash2,
  ChevronDown,
  Heart,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import resourcesAPI from '../services/resourcesAPI';
import engagementAPI from '../services/engagementAPI';

const Resources = () => {
  const { user } = useUser();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [likedResources, setLikedResources] = useState(new Set());

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    tags: '',
    file: null,
  });

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const result = await resourcesAPI.getAllResources();
    if (result.ok) {
      setResources(result.resources);
      // Initialize likedResources based on current user's likes
      const userLiked = new Set();
      result.resources.forEach(resource => {
        if (resource.likes?.includes(user?.id)) {
          userLiked.add(resource.id);
        }
      });
      setLikedResources(userLiked);
    }
    setLoading(false);
  };

  // Mock data for resources
  const mockResources = [];

  // Filter and sort resources
  const filteredResources = resources
    .filter(resource => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
      const matchesType = filterType === 'all' || resource.type === filterType;

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'views':
          return b.views - a.views;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

  const handleUploadChange = useCallback((e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
      }));
    }
  }, []);

  const handleUpload = async () => {
    if (
      !uploadData.title ||
      !uploadData.description ||
      !uploadData.category ||
      !uploadData.type ||
      !uploadData.file
    ) {
      alert('Please fill all fields');
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to upload');
      return;
    }

    const tags = uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const result = await resourcesAPI.uploadResource(
        uploadData.file,
        {
          title: uploadData.title,
          description: uploadData.description,
          category: uploadData.category,
          type: uploadData.type,
          tags,
          uploaderName: user.displayName || user.email,
        },
        user.id
      );

      if (result.ok) {
        alert('Resource uploaded successfully!');
        setResources([result, ...resources]);
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          category: '',
          type: '',
          tags: '',
          file: null,
        });
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.error || error.message || 'Upload failed');
    }
  };

  const handleDownload = async (resource) => {
    await resourcesAPI.incrementDownloads(resource.id);
    // Download file from base64 data
    const link = document.createElement('a');
    link.href = resource.fileData || resource.fileUrl; // Use fileData (base64) if available
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (resource) => {
    const shareText = `Check out this resource: "${resource.title}" - ${resource.description}`;
    const shareUrl = `${window.location.origin}`;

    // Copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert('Resource link copied to clipboard!');

    // Social sharing URLs (optional)
    const encodedText = encodeURIComponent(shareText);
    console.log('Share URLs:');
    console.log('Twitter:', `https://twitter.com/intent/tweet?text=${encodedText}`);
    console.log('Facebook:', `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
    console.log('LinkedIn:', `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`);
  };

  const handleAddRating = async () => {
    if (!selectedResourceId) return;

    const result = await resourcesAPI.addRating(
      selectedResourceId,
      user.id,
      selectedRating,
      reviewText
    );

    if (result.ok) {
      alert('Rating and review added successfully!');
      // Reload resources to show updated rating
      loadResources();
      setShowRatingModal(false);
      setReviewText('');
      setSelectedRating(5);
    } else {
      alert(result.error || 'Failed to add rating');
    }
  };

  const handleDeleteResource = async (resourceId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    const result = await resourcesAPI.deleteResource(resourceId, user.id, fileName);
    if (result.ok) {
      alert('Resource deleted successfully!');
      setResources(resources.filter(r => r.id !== resourceId));
    } else {
      alert(result.error || 'Failed to delete resource');
    }
  };

  const handleToggleLike = async (resourceId) => {
    const result = await engagementAPI.toggleResourceLike(resourceId, user.id);
    if (result.ok) {
      const newLiked = new Set(likedResources);
      if (result.liked) {
        newLiked.add(resourceId);
      } else {
        newLiked.delete(resourceId);
      }
      setLikedResources(newLiked);
      loadResources();
    }
  };

  const handleAddComment = async (resourceId) => {
    if (!commentText[resourceId]?.trim()) return;

    const result = await engagementAPI.addResourceComment(
      resourceId,
      user.id,
      user.displayName || user.email,
      commentText[resourceId]
    );

    if (result.ok) {
      setCommentText(prev => ({ ...prev, [resourceId]: '' }));
      loadResources();
    } else {
      alert(result.error || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (resourceId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    const result = await engagementAPI.deleteResourceComment(resourceId, commentId);
    if (result.ok) {
      loadResources();
    } else {
      alert(result.error || 'Failed to delete comment');
    }
  };

  const RatingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowRatingModal(false)}>
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rate & Review</h2>
          <button
            onClick={() => setShowRatingModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`p-2 rounded ${
                    star <= selectedRating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  <Star
                    className="w-8 h-8 fill-current"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this resource..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowRatingModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResourceCard = ({ resource }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {resource.type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{resource.title}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
            {resource.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags && resource.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <Link 
                to={`/profile/${resource.ownerId}`}
                className="hover:text-blue-600 transition"
              >
                {resource.uploader}
              </Link>
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(resource.uploadDate?.toDate?.() || resource.uploadDate).toLocaleDateString()}
            </span>
          </div>
          <span>{resource.fileSize}</span>
        </div>

        {/* Rating Display */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(resource.averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({resource.ratings?.length || 0} ratings)
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {resource.views || 0}
            </span>
            <span className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              {resource.downloads || 0}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleDownload(resource)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
          <button
            onClick={() => handleToggleLike(resource.id)}
            disabled={likedResources.has(resource.id)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center ${
              likedResources.has(resource.id)
                ? 'bg-red-100 text-red-700 cursor-not-allowed opacity-75'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 mr-1 ${likedResources.has(resource.id) ? 'fill-current' : ''}`} />
            Like ({resource.likes?.length || 0})
          </button>
          <button
            onClick={() => setExpandedComments(prev => ({ ...prev, [resource.id]: !prev[resource.id] }))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comments ({resource.comments?.length || 0})
          </button>
          <button
            onClick={() => {
              setSelectedResourceId(resource.id);
              setShowRatingModal(true);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
          >
            <Star className="w-4 h-4 mr-1" />
            Rate
          </button>
          <button
            onClick={() => handleShare(resource)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </button>
          {user?.id === resource.uploaderId && (
            <button
              onClick={() => handleDeleteResource(resource.id, resource.fileName)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          )}
        </div>

        {/* Comments Section */}
        {expandedComments[resource.id] && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
            <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
              {resource.comments && resource.comments.length > 0 ? (
                resource.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          to={`/profile/${comment.userId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm"
                        >
                          {comment.userName}
                        </Link>
                        <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user?.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(resource.id, comment.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No comments yet. Be the first!</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText[resource.id] || ''}
                onChange={(e) => setCommentText(prev => ({ ...prev, [resource.id]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAddComment(resource.id)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
              <p className="text-gray-600">Discover and share study materials with your peers</p>
            </div>
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Resource
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Notebook">Notebook</option>
                <option value="Slide">Slide</option>
                <option value="Document">Document</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Sort: Recent</option>
                <option value="downloads">Sort: Most Downloads</option>
                <option value="views">Sort: Most Views</option>
                <option value="rating">Sort: Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredResources.length} Resources Found
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && <UploadModalComponent 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadData={uploadData}
        onUploadChange={handleUploadChange}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />}
      {showRatingModal && <RatingModal />}
    </div>
  );
};

// Separate UploadModal Component to prevent re-renders
const UploadModalComponent = ({ 
  isOpen, 
  onClose, 
  uploadData, 
  onUploadChange, 
  onFileChange, 
  onUpload 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={uploadData.title}
              onChange={onUploadChange}
              placeholder="Resource title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={uploadData.description}
              onChange={onUploadChange}
              placeholder="Resource description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={uploadData.category}
                onChange={onUploadChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={uploadData.type}
                onChange={onUploadChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Notebook">Notebook</option>
                <option value="Slide">Slide</option>
                <option value="Document">Document</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={uploadData.tags}
              onChange={onUploadChange}
              placeholder="e.g., React, JavaScript, Frontend"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <input
              type="file"
              onChange={onFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {uploadData.file && (
              <p className="text-sm text-gray-600 mt-2">Selected: {uploadData.file.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;

